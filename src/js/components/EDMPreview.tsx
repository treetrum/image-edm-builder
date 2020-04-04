import * as React from "react";

import { SectionType } from "./ImageAdder";

const EDMPreview: React.FC<{
    sections: SectionType[];
    focussedImageIndex: number | null;
}> = (props) => {
    return (
        <div className="edm-preview">
            {props.sections.map(({ file, link, publicUrl }, index) => {
                return (
                    <div
                        key={index}
                        className={
                            props.focussedImageIndex === null
                                ? ""
                                : index === props.focussedImageIndex
                                ? "focussed"
                                : "not-focussed"
                        }
                    >
                        {publicUrl ? (
                            link ? (
                                <a href={link}>
                                    <img src={publicUrl} />
                                </a>
                            ) : (
                                <img src={publicUrl} />
                            )
                        ) : (
                            <p>Loading {file.name}</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default EDMPreview;
