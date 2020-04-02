import React, { useState, useRef, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const cloudName = "image-edm-builder";
const unsignedUploadPreset = "q6wqyxqr";

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
    const [images, setImages] = useState([
        // {
        //     file: { name: "Test-file-name-1.jpg" }
        // },
        // {
        //     file: { name: "Test-file-name-2.jpg" }
        // },
        // {
        //     file: { name: "Test-file-name-3.jpg" }
        // }
    ]);
    const [uploadCount, setUploadCount] = useState(0);
    const [uploaderValue, setUploaderValue] = useState("");
    const [html, setHtml] = useState("");

    const [publicUrl, setPublicUrl] = useState("");
    const [downloadLink, setDownloadLink] = useState("");

    const inputRef = useRef(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let changed = false;
        const nextImages = [];
        const needsUploading = !!images.find(image => !image.uploaded);
        if (!needsUploading) return;
        setLoading(true);
        const promises = images.map(async image => {
            if (!image.uploaded) {
                changed = true;
                const compressed = await imageCompression(image.file, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 99999
                });
                const { url, publicUrl } = await getPresignedURL(compressed);
                await fetch(url, {
                    method: "PUT",
                    body: compressed
                });
                return {
                    file: compressed,
                    uploadData: { publicUrl },
                    uploaded: true
                };
            } else {
                return image;
            }
        });
        Promise.all(promises).then(images => {
            if (changed) {
                setImages(images);
            }
            setLoading(false);
        });
    }, [images]);

    console.log(images);

    function moveItemInArray(arr, from, to) {
        return arr.reduce((prev, current, idx, self) => {
            if (from === to) {
                prev.push(current);
            }
            if (idx === from) {
                return prev;
            }
            if (from < to) {
                prev.push(current);
            }
            if (idx === to) {
                prev.push(self[from]);
            }
            if (from > to) {
                prev.push(current);
            }
            return prev;
        }, []);
    }

    return (
        <div className="frame">
            <div className="frame__sidebar">
                <div className="sidebar">
                    <div className="sidebar__header">
                        <div className="sidebar__title">
                            <h1>EDM Builder</h1>
                        </div>
                    </div>
                    <div className="sidebar__body">
                        <DragDropContext
                            onDragEnd={({ source, destination }) => {
                                setImages(old => {
                                    return moveItemInArray(
                                        old,
                                        source.index,
                                        destination.index
                                    );
                                });
                            }}
                        >
                            <div className="instructions">
                                <h3>Links</h3>
                                <ul>
                                    <li>
                                        Standard links must start with http://
                                        or https://
                                    </li>
                                    <li>Email links must start with mailto:</li>
                                    <li>Phone links must start with tel:</li>
                                </ul>
                            </div>
                            <hr />
                            <Droppable droppableId="reorderer">
                                {provided => (
                                    <div
                                        className="orderer"
                                        {...provided.draggableProps}
                                        ref={provided.innerRef}
                                    >
                                        {images.map(({ file }, index) => {
                                            return (
                                                <Draggable
                                                    key={file.name}
                                                    draggableId={file.name}
                                                    index={index}
                                                >
                                                    {provided => (
                                                        <div
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            ref={
                                                                provided.innerRef
                                                            }
                                                            key={index}
                                                            className="drag-item"
                                                        >
                                                            <div className="drag-item__indicator">
                                                                <div className="drag-item__indicator__inner">
                                                                    <span></span>
                                                                    <span></span>
                                                                    <span></span>
                                                                </div>
                                                            </div>
                                                            <div className="drag-item__content">
                                                                <div className="drag-item__name">
                                                                    {file.name}
                                                                </div>
                                                                <div className="drag-item__url-input">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Image URL (optional)"
                                                                        value={
                                                                            images[
                                                                                index
                                                                            ]
                                                                                .link
                                                                        }
                                                                        onChange={e => {
                                                                            const {
                                                                                value
                                                                            } = e.target;
                                                                            setImages(
                                                                                old => {
                                                                                    return old.map(
                                                                                        (
                                                                                            image,
                                                                                            idx
                                                                                        ) => {
                                                                                            if (
                                                                                                index ===
                                                                                                idx
                                                                                            ) {
                                                                                                return {
                                                                                                    ...image,
                                                                                                    link: value
                                                                                                };
                                                                                            }
                                                                                            return image;
                                                                                        }
                                                                                    );
                                                                                }
                                                                            );
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        {images.length === 0 && (
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
                                            newFiles.push({
                                                file,
                                                uploaded: false
                                            });
                                        }
                                        setImages(i => [...i, ...newFiles]);

                                        inputRef.current.value = null;
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="sidebar__footer">
                        {publicUrl && (
                            <a
                                className="button"
                                target="_blank"
                                href={publicUrl}
                            >
                                View in browser
                            </a>
                        )}
                        {downloadLink && (
                            <a
                                className="button"
                                target="_blank"
                                href={downloadLink}
                            >
                                Download zip
                            </a>
                        )}
                        {images.length > 0 && (
                            <button
                                className="button button--rounded"
                                onClick={async () => {
                                    setLoading(true);
                                    const data = {
                                        edm_id: "test-edm",
                                        preheader: "Example preheader",
                                        sections: images.map(image => ({
                                            link: image.link || "",
                                            alt: "",
                                            public_url:
                                                image.uploadData.publicUrl
                                        }))
                                    };
                                    const {
                                        publicURL,
                                        zipDownload
                                    } = await createEdmLinks(data);
                                    setPublicUrl(publicURL);
                                    setDownloadLink(zipDownload);
                                    setLoading(false);
                                }}
                            >
                                {loading ? "Loading..." : "Generate EDM"}
                            </button>
                        )}
                        {images.length > 0 && (
                            <button
                                type="button"
                                className="button button--red"
                                target="_blank"
                                onClick={() => {
                                    setImages([]);
                                }}
                            >
                                Start again
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="frame__preview">
                <div className="edm-preview">
                    {images.map(({ uploadData = {}, file, link }, index) => {
                        return (
                            <div key={index}>
                                {uploadData.publicUrl ? (
                                    link ? (
                                        <a href={link}>
                                            <img src={uploadData.publicUrl} />
                                        </a>
                                    ) : (
                                        <img src={uploadData.publicUrl} />
                                    )
                                ) : (
                                    <p>Loading {file.name}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ImageAdder;
