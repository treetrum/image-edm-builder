import * as React from "react";
import DragIndicator from "./DragIndicator";

interface PropsType {
    draggableProps: any;
    dragHandleProps: any;
    index: number;
    file: File;
    inputProps: React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
    >;
}

const DragItem = React.forwardRef<HTMLDivElement, PropsType>((props, ref) => {
    return (
        <div
            {...props.draggableProps}
            {...props.dragHandleProps}
            ref={ref}
            key={props.index}
            className="drag-item"
        >
            <div className="drag-item__indicator">
                <DragIndicator></DragIndicator>
            </div>
            <div className="drag-item__content">
                <div className="drag-item__name">{props.file.name}</div>
                <div className="drag-item__url-input">
                    <input
                        type="text"
                        placeholder="Section link"
                        {...props.inputProps}
                    />
                </div>
            </div>
        </div>
    );
});

export default DragItem;
