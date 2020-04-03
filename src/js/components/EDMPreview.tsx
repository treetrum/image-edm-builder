import * as React from "react";

const EDMPreview: React.FC<{ sections: SectionType[] }> = props => {
    return (
        <div className="edm-preview">
            {props.sections.map(({ file, link, publicUrl }, index) => {
                return (
                    <div key={index}>
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
