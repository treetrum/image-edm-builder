const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk");
const Jimp = require("jimp");

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

const checkParams = (body, params) => {
    const missing = [];
    for (const paramName of params) {
        if (body[paramName]) {
        } else {
            missing.push(paramName);
        }
    }
    if (missing.length > 0) {
        return {
            statusCode: 400,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                success: false,
                message: `Missing params: ${missing.join(", ")}`,
            }),
        };
    }
    return null;
};

exports.handler = async (event, context) => {
    const body = JSON.parse(event.body);

    // Check requried params
    const paramError = checkParams(body, [
        "image",
        "file_type",
        "file_name",
        "edm_id",
    ]);
    if (paramError) {
        return paramError;
    }

    const encodedImage = body.image;
    const decodedImage = Buffer.from(encodedImage, "base64");

    const jimpImage = await Jimp.read(decodedImage);
    const compressed = await jimpImage
        .quality(85)
        .getBufferAsync(body.file_type);

    // Log file sizes
    console.log({
        oldFileSize: `${(decodedImage.length / 1024 / 1024).toFixed(2)}MB`,
        newFileSize: `${(compressed.length / 1024 / 1024).toFixed(2)}MB`,
    });

    // Upload image to S3
    const uploadResponse = await upload({
        Bucket: process.env.BUCKET_NAME,
        Key: `images/${body.edm_id}/${body.file_name}`,
        Body: compressed,
        ACL: "public-read",
        ContentType: body.file_type,
    });

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            success: true,
            public_url: uploadResponse.Location,
        }),
    };
};
