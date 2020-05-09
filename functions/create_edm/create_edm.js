const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk");
const request = require("request-promise");
const JSZip = require("jszip");

const TEMPLATE_PATH = path.join(__dirname, "./template.html");

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const upload = (config) => {
    return new Promise((resolve, reject) => {
        s3.upload(config, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
};

const createImageMarkup = (imageUrl, link) => {
    return `<tr>
        <td>
            ${link ? `<a href="${link}">` : ""}
            <img src="${imageUrl}" alt="" style="display: block;" width="100%"/>
            ${link ? `</a>` : ""}
        </td>
    </tr>`;
};

exports.handler = async (event, context) => {
    const { user } = context.clientContext;
    if (!user || !user.email) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                success: false,
                message: "Not authorized",
            }),
        };
    }

    // Attempt to read the data
    const data = JSON.parse(event.body);

    // Get our template string
    const template = fs.readFileSync(TEMPLATE_PATH).toString();

    // Generate the markup for each section
    let imagesMarkup = [];
    const imagesData = [];

    const promises = data.sections.map(async (section) => {
        console.log(`Downloading: ${section.public_url}`);
        const downloaded = await request.get({
            url: section.public_url,
            encoding: null,
        });
        console.log(`Downloaded: ${section.public_url}`);
        return {
            data: {
                data: Buffer.from(downloaded, "utf8"),
                name: section.public_url.split("/").pop(),
            },
            markup: createImageMarkup(section.public_url, section.link),
        };
    });

    const responses = await Promise.all(promises);
    responses.forEach(({ data, markup }) => {
        imagesMarkup.push(markup);
        imagesData.push(data);
    });

    imagesMarkup = imagesMarkup.join("\n");

    console.log("Generating markup");

    // Replace all variables with filled in content
    const responseBody = template
        .replace("{{images}}", imagesMarkup)
        .replace("{{preheader}}", data.preheader);

    // Create a zip
    console.log("Creating zip");
    const zip = new JSZip();
    zip.file("index.html", responseBody);
    const images = zip.folder("images");
    for (const image of imagesData) {
        images.file(image.name, image.data);
    }
    const zipData = await zip.generateAsync({ type: "nodebuffer" });

    // Create datestring
    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    const datestring = `${year}${month}${day}`;

    // Upload html to s3
    console.log("Uploading html to s3");
    const htmlUploadResponse = await upload({
        Bucket: process.env.BUCKET_NAME,
        Key: `edms/${data.edm_id}-${datestring}/index.html`,
        Body: Buffer.from(responseBody),
        ACL: "public-read",
        ContentType: "text/html",
    });

    // Upload zip to s3
    console.log("Uploading zip to s3");
    const zipUploadResponse = await upload({
        Bucket: process.env.BUCKET_NAME,
        Key: `edms/${data.edm_id}-${datestring}/edm.zip`,
        Body: zipData,
        ACL: "public-read",
        ContentType: "application/zip",
    });

    console.log("Success - responding now.");
    return {
        headers: {
            "Content-Type": "application/json",
        },
        statusCode: 200,
        body: JSON.stringify({
            publicURL: htmlUploadResponse.Location,
            zipDownload: zipUploadResponse.Location,
        }),
    };
};
