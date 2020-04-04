const AWS = require("aws-sdk");

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});

const createErrorResponse = message => {
    return {
        headers: {
            "Content-Type": "application/json"
        },
        statusCode: 400,
        body: JSON.stringify({ error: message })
    };
};

exports.handler = async (event, context) => {
    const { fileName, fileType } = event.queryStringParameters;
    if (!fileName) {
        return createErrorResponse("missing fileName parameter");
    }
    if (!fileType) {
        return createErrorResponse("missing fileType parameter");
    }
    const uploadFileName = `images/${fileName}`;
    const url = s3.getSignedUrl("putObject", {
        Bucket: process.env.BUCKET_NAME,
        Expires: 60, // 1 hour expiry
        ACL: "public-read",
        Key: uploadFileName,
        ContentType: fileType
    });
    return {
        headers: {
            "Content-Type": "application/json"
        },
        statusCode: 200,
        body: JSON.stringify({
            url,
            publicUrl: `https://${process.env.BUCKET_NAME}.s3-ap-southeast-2.amazonaws.com/${uploadFileName}`
        })
    };
};
