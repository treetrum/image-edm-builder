import * as React from "react";
import { User } from "netlify-identity-widget";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import API from "../utils/API";
import SpinnerSVG from "../../images/spinner.svg";
import StackMailLogo from "../../images/stackmail-logo.svg";
import { SectionType, EDMDataType } from "../Types";
import moveItemInArray from "../utils/moveItemInArray";
import useFormInputs from "../hooks/useFormInputs";
import useMergableState from "../hooks/useMergableState";
import Button from "./Button";
import EDMPreview from "./EDMPreview";
import DragItem from "./DragItem";
import Frame from "./Frame";
import TreeInput from "./TreeInput";

const ImageAdder: React.FC<{ user: User }> = (props) => {
    const Api = new API(props.user);
    const fileUploadInputRef = React.useRef(null);
    const { formInputs, setInputValue, setInputError } = useFormInputs({
        id: { value: "", error: "" },
        preHeader: { value: "", error: "" },
    });
    const { state, setState } = useMergableState({
        publicUrl: "",
        downloadLink: "",
        loading: false,
        focussedImage: null,
        sections: [] as SectionType[],
    });

    const imagesUploading = !!state.sections.find((section) => !section.uploaded);

    React.useEffect(() => {
        const needsUploading = !!state.sections.find((section) => !section.uploaded);
        if (!needsUploading) return;
        setState({ loading: true });
        const promises = state.sections.map(
            async (section): Promise<SectionType> => {
                if (!section.uploaded) {
                    const result = await Api.compressAndUploadImage(
                        section.file,
                        formInputs.id.value
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
            setState({
                sections,
                loading: false,
            });
        });
    }, [state.sections]);

    const generateEDM = async (): Promise<void> => {
        setState({
            publicUrl: "",
            downloadLink: "",
            loading: true,
        });
        const data: EDMDataType = {
            edm_id: formInputs.id.value,
            preheader: formInputs.preHeader.value,
            sections: state.sections.map((section) => ({
                link: section.link || "",
                alt: "",
                public_url: section.publicUrl,
            })),
        };
        const { publicURL, zipDownload } = await Api.generateEDMLinks(data);
        setState({
            publicUrl: publicURL,
            downloadLink: zipDownload,
            loading: false,
        });
    };

    const handleDragEnd = ({ source, destination }: DropResult) => {
        setState({
            focussedImage: null,
            sections: moveItemInArray(state.sections, source.index, destination.index),
        });
    };

    const handleFileUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles: SectionType[] = [];
        for (const file of event.target.files) {
            newFiles.push({
                file,
                uploaded: false,
            });
        }
        setState({ sections: newFiles });
        fileUploadInputRef.current.value = null;
    };

    const handleSectionURLChange = (index: number, value: string) => {
        setState({
            sections: state.sections.map((section, idx) => {
                if (index === idx) {
                    return {
                        ...section,
                        link: value,
                    };
                }
                return section;
            }),
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
                            {...provided.droppableProps}
                        >
                            {state.sections.map(({ file }, index) => (
                                <Draggable key={file.name} draggableId={file.name} index={index}>
                                    {(provided) => (
                                        <DragItem
                                            index={index}
                                            ref={provided.innerRef}
                                            dragHandleProps={provided.dragHandleProps}
                                            draggableProps={provided.draggableProps}
                                            file={file}
                                            inputProps={{
                                                value: state.sections[index].link || "",
                                                onChange: (e) =>
                                                    handleSectionURLChange(index, e.target.value),
                                                onFocus: () => {
                                                    setState({ focussedImage: index });
                                                },
                                                onBlur: () => {
                                                    setState({ focussedImage: null });
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
                                state.sections.length !== 0
                                    ? `Click "Start Again" to change this`
                                    : formInputs.id.error
                                    ? ""
                                    : "Lowercase letters & dashes only"
                            }
                            error={formInputs.id.error ? "Lowercase letters & dashes only" : ""}
                            value={formInputs.id.value}
                            onChange={(event) => {
                                const value = event.target.value;
                                setInputValue("id", value.toLowerCase());
                                const re = new RegExp(/^[a-z\-]+$/, "g");
                                if (re.test(value)) {
                                    setInputError("id", "");
                                } else {
                                    setInputError("id", "true");
                                }
                            }}
                            placeholder="example-edm-id"
                            disabled={state.sections.length !== 0}
                        />
                        <TreeInput
                            id="preheader"
                            label="Pre Header Text"
                            info="Shown under the subject line in email clients"
                            onChange={(event) => {
                                setInputValue("preHeader", event.target.value);
                            }}
                            value={formInputs.preHeader.value}
                        />
                    </div>

                    {state.sections.length === 0 ? (
                        <div>
                            <input
                                ref={fileUploadInputRef}
                                type="file"
                                id="image-upload"
                                multiple
                                onChange={handleFileUploadChange}
                                disabled={!formInputs.id.value || !!formInputs.id.error}
                                hidden
                            />
                            <label htmlFor="image-upload">
                                <Button disabled={!formInputs.id.value || !!formInputs.id.error}>
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
                                    Standard links must start with <code>http://</code> or{" "}
                                    <code>https://</code>
                                </li>
                                <li>
                                    Email links must start with <code>mailto:</code>
                                </li>
                                <li>
                                    Phone links must start with <code>tel:</code>
                                </li>
                            </ul>
                        </div>
                    </div>
                </>
            }
            footer={
                <>
                    <Button visible={!!state.publicUrl} href={state.publicUrl} target="_blank">
                        View in browser
                    </Button>
                    <Button visible={!!state.downloadLink} href={state.downloadLink}>
                        Download ZIP
                    </Button>
                    <Button visible={state.sections.length > 0} onClick={generateEDM}>
                        {state.loading
                            ? "Loading..."
                            : state.publicUrl
                            ? "ReGenerate EDM"
                            : "Generate EDM"}
                    </Button>
                    <Button
                        className="button button--red"
                        onClick={() => {
                            setState({
                                publicUrl: "",
                                downloadLink: "",
                                sections: [],
                            });
                        }}
                    >
                        Start again
                    </Button>
                </>
            }
            preview={
                state.sections.length > 0 && !imagesUploading ? (
                    <EDMPreview
                        focussedImageIndex={state.focussedImage}
                        sections={state.sections}
                    />
                ) : (
                    <div className="preview-info">
                        <div className="preview-info__inner">
                            {imagesUploading ? (
                                <img style={{ width: 75 }} src={SpinnerSVG} alt="" />
                            ) : (
                                <>
                                    <h3>EDM Preview</h3>
                                    <p>
                                        A live preview of your EDM will appear here once you begin
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
