import * as React from "react";
import imageCompression from "browser-image-compression";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import moveItemInArray from "../utils/moveItemInArray";
import API from "../utils/API";
import Button from "./Button";
import EDMPreview from "./EDMPreview";
import DragItem from "./DragItem";
import Frame from "./Frame";

const ImageAdder = () => {
    const [images, setImages] = React.useState<SectionType[]>([]);
    const [publicUrl, setPublicUrl] = React.useState("");
    const [downloadLink, setDownloadLink] = React.useState("");
    const fileUploadInputRef = React.useRef(null);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const needsUploading = !!images.find(image => !image.uploaded);
        if (!needsUploading) return;
        setLoading(true);
        const promises = images.map(
            async (image): Promise<SectionType> => {
                if (!image.uploaded) {
                    const compressed = await imageCompression(image.file, {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 99999
                    });
                    const { url, publicUrl } = await API.getPresignedURL(
                        compressed
                    );
                    await fetch(url, {
                        method: "PUT",
                        body: compressed
                    });
                    return {
                        file: compressed,
                        publicUrl: publicUrl,
                        uploaded: true
                    };
                } else {
                    return image;
                }
            }
        );
        Promise.all(promises).then(images => {
            setImages(images);
            setLoading(false);
        });
    }, [images]);

    const generateEDM = async () => {
        setLoading(true);
        const data = {
            edm_id: "test-edm",
            preheader: "Example preheader",
            sections: images.map(image => ({
                link: image.link || "",
                alt: "",
                public_url: image.publicUrl
            }))
        };
        const { publicURL, zipDownload } = await API.generateEDMLinks(data);
        setPublicUrl(publicURL);
        setDownloadLink(zipDownload);
        setLoading(false);
    };

    const handleDragEnd = ({ source, destination }) => {
        setImages(old => {
            return moveItemInArray(old, source.index, destination.index);
        });
    };

    const handleFileUploadChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newFiles: SectionType[] = [];
        for (const file of event.target.files) {
            newFiles.push({
                file,
                uploaded: false
            });
        }
        setImages(newFiles);
        fileUploadInputRef.current.value = null;
    };

    const handleSectionURLChange = (index: number, value: string) => {
        setImages(old => {
            return old.map((image, idx) => {
                if (index === idx) {
                    return {
                        ...image,
                        link: value
                    };
                }
                return image;
            });
        });
    };

    return (
        <Frame
            title="EDM Builder"
            body={
                <>
                    <div className="instructions">
                        <h3>Links</h3>
                        <ul>
                            <li>
                                Standard links must start with http:// or
                                https://
                            </li>
                            <li>Email links must start with mailto:</li>
                            <li>Phone links must start with tel:</li>
                        </ul>
                    </div>
                    <hr />
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="reorderer">
                            {provided => (
                                <div
                                    className="orderer"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                >
                                    {images.map(({ file }, index) => (
                                        <Draggable
                                            key={file.name}
                                            draggableId={file.name}
                                            index={index}
                                        >
                                            {provided => (
                                                <DragItem
                                                    index={index}
                                                    ref={provided.innerRef}
                                                    dragHandleProps={
                                                        provided.dragHandleProps
                                                    }
                                                    draggableProps={
                                                        provided.draggableProps
                                                    }
                                                    file={file}
                                                    inputProps={{
                                                        value:
                                                            images[index]
                                                                .link || "",
                                                        onChange: e =>
                                                            handleSectionURLChange(
                                                                index,
                                                                e.target.value
                                                            )
                                                    }}
                                                />
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    {images.length === 0 && (
                        <div>
                            <input
                                ref={fileUploadInputRef}
                                type="file"
                                id="image-upload"
                                multiple
                                onChange={handleFileUploadChange}
                            />
                        </div>
                    )}
                </>
            }
            footer={
                <>
                    <Button visible={!!publicUrl} href={publicUrl}>
                        View in browser
                    </Button>
                    <Button visible={!!downloadLink} href={downloadLink}>
                        Download ZIP
                    </Button>
                    <Button visible={images.length > 0} onClick={generateEDM}>
                        {loading ? "Loading..." : "Generate EDM"}
                    </Button>
                    <Button
                        visible={images.length > 0}
                        className="button button--red"
                        onClick={() => setImages([])}
                    >
                        Start again
                    </Button>
                </>
            }
            preview={<EDMPreview sections={images} />}
        />
    );
};

export default ImageAdder;
