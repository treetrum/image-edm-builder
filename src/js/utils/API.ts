interface EDMDataType {}

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
            body: JSON.stringify(edmData)
        });
        return await res.json();
    };
}

export default API;
