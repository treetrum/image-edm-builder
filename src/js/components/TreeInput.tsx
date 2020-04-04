import * as React from "react";

interface TreeInputProps {
    id: string;
    label: string;
    info?: string;
    error?: string;
}

type PropsType = TreeInputProps &
    React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
    >;

const TreeInput: React.FC<PropsType> = ({
    id,
    label,
    info,
    error,
    ...props
}) => {
    return (
        <div className={`tree-input ${props.disabled ? "disabled" : ""}`}>
            <label htmlFor={id} className="tree-input__label">
                {label}
            </label>
            <input
                className="tree-input__input"
                type="text"
                id={id}
                name={id}
                {...props}
            />
            {info && <div className="tree-input__info">{info}</div>}
            {error && <div className="tree-input__error">{error}</div>}
        </div>
    );
};

export default TreeInput;
