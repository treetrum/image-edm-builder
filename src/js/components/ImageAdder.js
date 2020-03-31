import React, { useState, useRef, useEffect } from "react";

const cloudName = "image-edm-builder";
const unsignedUploadPreset = "q6wqyxqr";

/**
 * @param {File} file
 */
const getPresignedURL = async file => {
    const res = await fetch(
        `/.netlify/functions/get_presigned_url?fileName=${file.name}&fileType=${file.type}`
    );
    return await res.json();
};

const createEdmLinks = async edmData => {
    const res = await fetch(`/.netlify/functions/create_edm`, {
        method: "POST",
        body: JSON.stringify(edmData)
    });
    return await res.json();
};

const ImageAdder = () => {
    const [images, setImages] = useState([]);
    const [uploadCount, setUploadCount] = useState(0);
    const [uploaderValue, setUploaderValue] = useState("");
    const [html, setHtml] = useState("");

    const [publicUrl, setPublicUrl] = useState("");
    const [downloadLink, setDownloadLink] = useState("");

    const inputRef = useRef(null);

    useEffect(() => {
        for (const image of images) {
            if (!image.uploaded) {
                getPresignedURL(image.file).then(({ url, publicUrl }) => {
                    fetch(url, { method: "PUT", body: image.file }).then(() => {
                        setImages(allImages => {
                            const i = allImages.findIndex(
                                img =>
                                    img.file.name === publicUrl.split("/").pop()
                            );
                            const image = allImages[i];
                            allImages[i].uploadData = { publicUrl };
                            return allImages;
                        });
                        setUploadCount(i => i + 1);
                    });
                });
            }
        }
    }, [images]);

    return (
        <div className="image-adder">
            <h1>EDM Builder</h1>
            <div className="edm-preview">
                {images.map(({ uploadData = {} }, index) => {
                    return (
                        <div key={index}>
                            {uploadData.publicUrl ? (
                                <img src={uploadData.publicUrl} alt="" />
                            ) : (
                                <p>Loading...</p>
                            )}
                        </div>
                    );
                })}
            </div>
            <div>
                <input
                    ref={inputRef}
                    type="file"
                    id="image-upload"
                    multiple
                    onChange={e => {
                        setUploaderValue(e.target.value);
                        const newFiles = [];
                        for (const file of e.target.files) {
                            newFiles.push({ file, uploaded: false });
                        }
                        setImages(i => [...i, ...newFiles]);
                        inputRef.current.value = null;
                    }}
                />
            </div>
            <button
                onClick={async () => {
                    const data = {};
                    data.edm_id = "test-edm";
                    data.preheader = "Example Preheader";
                    data.sections = images.map(image => ({
                        link: "",
                        alt: "",
                        public_url: image.uploadData.publicUrl
                    }));
                    const response = await createEdmLinks(data);
                    console.log(response);
                    setPublicUrl(response.publicURL);
                    setDownloadLink(response.zipDownload);
                }}
            >
                Generate EDM
            </button>
            <div>
                {publicUrl && (
                    <a target="_blank" href={publicUrl}>
                        View in browser
                    </a>
                )}
            </div>
            <div>
                {downloadLink && (
                    <a target="_blank" href={downloadLink}>
                        Download zip
                    </a>
                )}
            </div>
        </div>
    );
};

export default ImageAdder;
