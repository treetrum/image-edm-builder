import * as React from "react";

interface PropsType {
    visible?: boolean;
    children: React.ReactChild;
    [key: string]: any;
}

const Button: React.FC<PropsType> = ({ visible, children, ...props }) => {
    if (!visible) return null;
    return (
        <a className="button" {...props}>
            {children}
        </a>
    );
};

Button.defaultProps = {
    visible: true,
};

export default Button;
