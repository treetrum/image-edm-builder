import * as React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import moveItemInArray from "../utils/moveItemInArray";
import API from "../utils/API";
import Button from "./Button";
import EDMPreview from "./EDMPreview";
import DragItem from "./DragItem";
import Frame from "./Frame";
import TreeInput from "./TreeInput";
import { User } from "netlify-identity-widget";
import SpinnerSVG from "../../images/spinner.svg";

import StackMailLogo from "../../images/stackmail-logo.svg";

export interface SectionType {
    file: File;
    uploaded: boolean;
    publicUrl?: string;
    link?: string;
}

const ImageAdder: React.FC<{ user: User }> = (props) => {
    const Api = new API(props.user);

    const fileUploadInputRef = React.useRef(null);
    const [sections, setSections] = React.useState<SectionType[]>([]);
    const [publicUrl, setPublicUrl] = React.useState("");
    const [downloadLink, setDownloadLink] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [edmName, setEdmName] = React.useState("");
    const [edmNameError, setEdmNameError] = React.useState(false);
    const imagesUploading = !!sections.find((section) => !section.uploaded);
    const [preheader, setPreheader] = React.useState("");
    const [focussedImage, setFocussedImage] = React.useState<null | number>(
        null
    );

    React.useEffect(() => {
        const needsUploading = !!sections.find((section) => !section.uploaded);
        if (!needsUploading) return;
        setLoading(true);
        const promises = sections.map(
            async (section): Promise<SectionType> => {
                if (!section.uploaded) {
                    const result = await Api.compressAndUploadImage(
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
        setPublicUrl("");
        setDownloadLink("");
        setLoading(true);
        const data = {
            edm_id: edmName,
            preheader: preheader,
            sections: sections.map((section) => ({
                link: section.link || "",
                alt: "",
                public_url: section.publicUrl,
            })),
        };
        const { publicURL, zipDownload } = await Api.generateEDMLinks(data);
        setPublicUrl(publicURL);
        setDownloadLink(zipDownload);
        setLoading(false);
    };

    const handleDragEnd = ({ source, destination }) => {
        setFocussedImage(null);
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

    const renderDragDrop = () => {
        return (
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
                                                    sections[index].link || "",
                                                onChange: (e) =>
                                                    handleSectionURLChange(
                                                        index,
                                                        e.target.value
                                                    ),
                                                onFocus: () => {
                                                    setFocussedImage(index);
                                                },
                                                onBlur: () => {
                                                    setFocussedImage(null);
                                                },
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
        );
    };

    return (
        <Frame
            title={<img src={StackMailLogo} alt="StackMail Logo" />}
            body={
                <>
                    <div>
                        <TreeInput
                            id="edm-name"
                            label="Unique ID"
                            info={
                                sections.length !== 0
                                    ? `Click "Start Again" to change this`
                                    : edmNameError
                                    ? ""
                                    : "Lowercase letters & dashes only"
                            }
                            error={
                                edmNameError
                                    ? "Lowercase letters & dashes only"
                                    : ""
                            }
                            value={edmName}
                            onChange={(event) => {
                                const value = event.target.value;
                                setEdmName(value.toLowerCase());
                                const re = new RegExp(/^[a-z\-]+$/, "g");
                                if (re.test(value)) {
                                    setEdmNameError(false);
                                } else {
                                    setEdmNameError(true);
                                }
                            }}
                            placeholder="example-edm-id"
                            disabled={sections.length !== 0}
                        />
                        <TreeInput
                            id="preheader"
                            label="Pre Header Text"
                            info="Shown under the subject line in email clients"
                            onChange={(event) => {
                                setPreheader(event.target.value);
                            }}
                            value={preheader}
                        />
                    </div>

                    {sections.length === 0 ? (
                        <div>
                            <input
                                ref={fileUploadInputRef}
                                type="file"
                                id="image-upload"
                                multiple
                                onChange={handleFileUploadChange}
                                disabled={!edmName || !!edmNameError}
                                hidden
                            />
                            <label htmlFor="image-upload">
                                <Button disabled={!edmName || !!edmNameError}>
                                    Choose files
                                </Button>
                            </label>
                        </div>
                    ) : (
                        <div>{renderDragDrop()}</div>
                    )}
                    <div>
                        <div className="instructions">
                            <h3>Link tips:</h3>
                            <ul>
                                <li>
                                    Standard links must start with{" "}
                                    <code>http://</code> or{" "}
                                    <code>https://</code>
                                </li>
                                <li>
                                    Email links must start with{" "}
                                    <code>mailto:</code>
                                </li>
                                <li>
                                    Phone links must start with{" "}
                                    <code>tel:</code>
                                </li>
                            </ul>
                        </div>
                    </div>
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
                        {loading
                            ? "Loading..."
                            : publicUrl
                            ? "ReGenerate EDM"
                            : "Generate EDM"}
                    </Button>
                    <Button
                        className="button button--red"
                        onClick={() => {
                            setPublicUrl("");
                            setDownloadLink("");
                            setSections([]);
                        }}
                    >
                        Start again
                    </Button>
                </>
            }
            preview={
                sections.length > 0 && !imagesUploading ? (
                    <EDMPreview
                        focussedImageIndex={focussedImage}
                        sections={sections}
                    />
                ) : (
                    <div className="preview-info">
                        <div className="preview-info__inner">
                            {imagesUploading ? (
                                <img
                                    style={{ width: 75 }}
                                    src={SpinnerSVG}
                                    alt=""
                                />
                            ) : (
                                <>
                                    <h3>EDM Preview</h3>
                                    <p>
                                        A live preview of your EDM will appear
                                        here once you begin
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )
            }
        />
    );
};

export default ImageAdder;
