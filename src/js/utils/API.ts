interface EDMDataType {}

const encodeImageFileAsURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        var reader = new FileReader();
        reader.onloadend = function () {
            if (typeof reader.result === "string") {
                resolve(reader.result.replace("data:image/jpeg;base64,", ""));
            }
        };
        reader.readAsDataURL(file);
    });
};

class API {
    static getPresignedURL = async (
        file: File
    ): Promise<{ url: string; publicUrl: string }> => {
        const res = await fetch(
            `/.netlify/functions/get_presigned_url?fileName=${file.name}&fileType=${file.type}`
        );
        return await res.json();
    };

    static generateEDMLinks = async (
        edmData: EDMDataType
    ): Promise<{ publicURL: string; zipDownload: string }> => {
        const res = await fetch(`/.netlify/functions/create_edm`, {
            method: "POST",
            body: JSON.stringify(edmData),
        });
        return await res.json();
    };

    static compressAndUploadImage = async (
        file: File,
        edmId: string
    ): Promise<{ success: boolean; public_url: string }> => {
        const base64Encoded = await encodeImageFileAsURL(file);
        const res = await fetch(
            "/.netlify/functions/compress_and_upload_image",
            {
                method: "POST",
                body: JSON.stringify({
                    file_type: file.type,
                    file_name: file.name,
                    edm_id: edmId,
                    image: base64Encoded,
                }),
            }
        );
        return await res.json();
    };
}

export default API;
