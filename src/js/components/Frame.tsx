import * as React from "react";
import imageCompression from "browser-image-compression";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import moveItemInArray from "../utils/moveItemInArray";
import API from "../utils/API";
import Button from "./Button";
import EDMPreview from "./EDMPreview";
import DragItem from "./DragItem";

const Frame: React.FC<{
    title: string;
    body: React.ReactChild;
    footer: React.ReactChild;
    preview: React.ReactChild;
}> = props => {
    return (
        <div className="frame">
            <div className="frame__sidebar">
                <div className="sidebar">
                    <div className="sidebar__header">
                        <div className="sidebar__title">
                            <h1>{props.title}</h1>
                        </div>
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
