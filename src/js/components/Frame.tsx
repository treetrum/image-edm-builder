import * as React from "react";

const Frame: React.FC<{
    title: React.ReactChild;
    body: React.ReactChild;
    footer: React.ReactChild;
    preview: React.ReactChild;
}> = (props) => {
    return (
        <div className="frame">
            <div className="frame__sidebar">
                <div className="sidebar">
                    <div className="sidebar__header">
                        <div className="sidebar__title">{props.title}</div>
                    </div>
                    <div className="sidebar__body">{props.body}</div>
                    <div className="sidebar__footer">{props.footer}</div>
                </div>
            </div>
            <div className="frame__preview">{props.preview}</div>
        </div>
    );
};

export default Frame;
