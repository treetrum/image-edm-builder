const AWS = require("aws-sdk");
const request = require("request-promise");
const JSZip = require("jszip");
const mime = require("mime");
const path = require("path");
const fs = require("fs");
const minifyHTML = require("html-minifier").minify;

const TEMPLATE_PATH = path.join(__dirname, "./template.html");

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});

const upload = config => {
    return new Promise((resolve, reject) => {
        s3.upload(config, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
};

exports.handler = async (event, context) => {
    // Attempt to read the data
    const data = JSON.parse(event.body);

    // Get our template string
    const template = fs.readFileSync(TEMPLATE_PATH).toString();

    // Generate the markup for each section
    let imagesMarkup = [];
    let imagesData = [];

    const promises = data.sections.map(section => {
        console.log(`Downloading: ${section.public_url}`);
        return request
            .get({ url: section.public_url, encoding: null })
            .then(downloaded => {
                imagesData.push({
                    data: Buffer.from(downloaded, "utf8"),
                    name: section.public_url.split("/").pop()
                });
                imagesMarkup.push(`<tr>
                    <td>
                        ${section.link ? `<a href="${section.link}">` : ""}
                        <img src="${
                            section.public_url
                        }" alt="" style="width: 600px" width="600"/>
                        ${section.link ? `</a>` : ""}
                    </td>
                </tr>`);
                console.log(`Downloaded: ${section.public_url}`);
            });
    });

    await Promise.all(promises);

    imagesMarkup = imagesMarkup.join("\n");

    console.log("Generating markup");
    // Replace all variables with filled in content, minify the HTML
    const responseBody = minifyHTML(
        template
            .replace("{{images}}", imagesMarkup)
            .replace("{{preheader}}", data.preheader),
        {
            collapseWhitespace: true
        }
    );

    // Create a zip
    console.log("Creating zip");
    const zip = new JSZip();
    zip.file("index.html", responseBody);
    const images = zip.folder("images");
    for (const image of imagesData) {
        images.file(image.name, image.data);
    }
    const zipData = await zip.generateAsync({ type: "nodebuffer" });

    // Upload html to s3
    console.log("Uploading html to s3");
    const htmlUploadResponse = await upload({
        Bucket: process.env.BUCKET_NAME,
        Key: `edms/${data.edm_id}/index.html`,
        Body: Buffer.from(responseBody),
        ACL: "public-read",
        ContentType: "text/html"
    });

    // Upload zip to s3
    console.log("Uploading zip to s3");
    const zipUploadResponse = await upload({
        Bucket: process.env.BUCKET_NAME,
        Key: `edms/${data.edm_id}/edm.zip`,
        Body: zipData,
        ACL: "public-read",
        ContentType: "application/zip"
    });

    console.log("Success - responding now.");
    return {
        headers: {
            "Content-Type": "application/json"
        },
        statusCode: 200,
        body: JSON.stringify({
            publicURL: htmlUploadResponse.Location,
            zipDownload: zipUploadResponse.Location
        })
    };
};
