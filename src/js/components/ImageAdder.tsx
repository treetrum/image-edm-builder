import * as React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import moveItemInArray from "../utils/moveItemInArray";
import API from "../utils/API";
import Button from "./Button";
import EDMPreview from "./EDMPreview";
import DragItem from "./DragItem";
import Frame from "./Frame";

interface SectionType {
    file: File;
    uploaded: boolean;
    publicUrl?: string;
    link?: string;
}

const ImageAdder = () => {
    const [sections, setSections] = React.useState<SectionType[]>([]);
    const [publicUrl, setPublicUrl] = React.useState("");
    const [downloadLink, setDownloadLink] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const fileUploadInputRef = React.useRef(null);

    React.useEffect(() => {
        const needsUploading = !!sections.find((section) => !section.uploaded);
        if (!needsUploading) return;
        setLoading(true);
        const promises = sections.map(
            async (section): Promise<SectionType> => {
                if (!section.uploaded) {
                    const result = await API.compressAndUploadImage(
                        section.file,
                        "test-edm"
                    );
                    return {
                        file: section.file,
                        publicUrl: result.public_url,
                        uploaded: true,
                    };
                } else {
                    return section;
                }
            }
        );
        Promise.all(promises).then((sections) => {
            setSections(sections);
            setLoading(false);
        });
    }, [sections]);

    const generateEDM = async () => {
        setLoading(true);
        const data = {
            edm_id: "test-edm",
            preheader: "Example preheader",
            sections: sections.map((section) => ({
                link: section.link || "",
                alt: "",
                public_url: section.publicUrl,
            })),
        };
        const { publicURL, zipDownload } = await API.generateEDMLinks(data);
        setPublicUrl(publicURL);
        setDownloadLink(zipDownload);
        setLoading(false);
    };

    const handleDragEnd = ({ source, destination }) => {
        setSections((old) => {
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
                uploaded: false,
            });
        }
        setSections(newFiles);
        fileUploadInputRef.current.value = null;
    };

    const handleSectionURLChange = (index: number, value: string) => {
        setSections((oldSections) => {
            return oldSections.map((section, idx) => {
                if (index === idx) {
                    return {
                        ...section,
                        link: value,
                    };
                }
                return section;
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
                            {(provided) => (
                                <div
                                    className="orderer"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                >
                                    {sections.map(({ file }, index) => (
                                        <Draggable
                                            key={file.name}
                                            draggableId={file.name}
                                            index={index}
                                        >
                                            {(provided) => (
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
                                                            sections[index]
                                                                .link || "",
                                                        onChange: (e) =>
                                                            handleSectionURLChange(
                                                                index,
                                                                e.target.value
                                                            ),
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
                    {sections.length === 0 && (
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
                    <Button
                        visible={!!publicUrl}
                        href={publicUrl}
                        target="_blank"
                    >
                        View in browser
                    </Button>
                    <Button visible={!!downloadLink} href={downloadLink}>
                        Download ZIP
                    </Button>
                    <Button visible={sections.length > 0} onClick={generateEDM}>
                        {loading ? "Loading..." : "Generate EDM"}
                    </Button>
                    <Button
                        visible={sections.length > 0}
                        className="button button--red"
                        onClick={() => setSections([])}
                    >
                        Start again
                    </Button>
                </>
            }
            preview={<EDMPreview sections={sections} />}
        />
    );
};

export default ImageAdder;
