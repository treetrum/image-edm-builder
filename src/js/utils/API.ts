import { User } from "netlify-identity-widget";
import { EDMDataType } from "../Types";

const encodeImageFileAsURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = function () {
            if (typeof reader.result === "string") {
                resolve(reader.result.replace("data:image/jpeg;base64,", ""));
            }
        };
        reader.readAsDataURL(file);
    });
};

class API {
    user: User;
    defaultHeaders = {};

    constructor(user: User) {
        this.user = user;
        this.defaultHeaders = {
            ...this.defaultHeaders,
            Authorization: `Bearer ${this.user.token.access_token}`,
        };
    }

    generateEDMLinks = async (
        edmData: EDMDataType
    ): Promise<{ publicURL: string; zipDownload: string }> => {
        const res = await fetch(`/.netlify/functions/create_edm`, {
            method: "POST",
            headers: this.defaultHeaders,
            body: JSON.stringify(edmData),
        });
        return await res.json();
    };

    compressAndUploadImage = async (
        file: File,
        edmId: string
    ): Promise<{ success: boolean; public_url: string }> => {
        const base64Encoded = await encodeImageFileAsURL(file);
        const res = await fetch("/.netlify/functions/compress_and_upload_image", {
            method: "POST",
            headers: this.defaultHeaders,
            body: JSON.stringify({
                file_type: file.type,
                file_name: file.name,
                edm_id: edmId,
                image: base64Encoded,
            }),
        });
        return await res.json();
    };
}

export default API;
