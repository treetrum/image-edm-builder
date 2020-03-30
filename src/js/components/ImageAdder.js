import React, { useState, useRef, useEffect } from "react";

const cloudName = "image-edm-builder";
const unsignedUploadPreset = "q6wqyxqr";

const uploadImage = async file => {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    const fd = new FormData();
    fd.append("upload_preset", unsignedUploadPreset);
    fd.append("tags", "browser_upload"); // Optional - add tag for image admin in Cloudinary
    fd.append("file", file);
    const res = await fetch(url, {
        method: "POST",
        body: fd
    });
    const json = await res.json();
    return json;
};

const template = `<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>
<div style="display: none; max-height: 0px; overflow: hidden;">Myrtle | Botany</div>
<body width="100%" bgcolor="#ffffff" style="margin: 0; mso-line-height-rule: exactly;">
<table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 655px; background-color: #ffffff; border: 1px solid #f7f7f7;">
{{images}}
</table>
</body>
</html>`;

const ImageAdder = () => {
    const [images, setImages] = useState([]);
    const [uploadCount, setUploadCount] = useState(0);
    const [uploaderValue, setUploaderValue] = useState("");
    const [html, setHtml] = useState("");

    const inputRef = useRef(null);

    useEffect(() => {
        for (const image of images) {
            if (!image.uploaded) {
                uploadImage(image.file).then(res => {
                    setImages(allImages => {
                        const i = allImages.findIndex(
                            img =>
                                img.file.name ===
                                res.secure_url.split("/").pop()
                        );
                        const image = allImages[i];
                        allImages[i].uploadData = res;
                        return allImages;
                    });
                    setUploadCount(i => i + 1);
                });
            }
        }
    }, [images]);

    return (
        <div className="image-adder">
            <div className="edm-preview">
                {images.map(({ uploadData = {} }, index) => {
                    return (
                        <div key={index}>
                            {uploadData.secure_url ? (
                                <img src={uploadData.secure_url} alt="" />
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
                onClick={() => {
                    // let html = template;
                    // const imageMarkup = images
                    //     .map(
                    //         image =>
                    //             `<tr><td><img width="100%" style="display:block;" alt="" src="${image.uploadData.secure_url}" /></td></tr>`
                    //     )
                    //     .join("\n");
                    // html = html.replace("{{images}}", imageMarkup);
                    // setHtml(html);

                    const data = {};
                    data.preheader = "";
                    data.sections = images.map(image => ({
                        link: "",
                        alt: "",
                        public_url: image.uploadData.secure_url
                    }));
                    setHtml(JSON.stringify(data));
                    // console.log(data);
                }}
            >
                Generate HTML
            </button>
            <div>
                <textarea
                    name=""
                    id=""
                    cols="30"
                    rows="10"
                    value={html}
                    onChange={() => {}}
                />
            </div>
        </div>
    );
};

export default ImageAdder;
