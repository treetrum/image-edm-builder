import * as React from "react";

interface PropsType {
    visible?: boolean;
    children: React.ReactChild;
    size?: "small" | "regular";
    color?: "red" | "blue";
}

const Button: React.FC<
    PropsType &
        React.DetailedHTMLProps<
            React.AnchorHTMLAttributes<HTMLAnchorElement>,
            HTMLAnchorElement
        >
> = ({ visible, children, size, color, ...props }) => {
    if (!visible) return null;
    return (
        <a className={`button button--${size} button--${color}`} {...props}>
            {children}
        </a>
    );
};

Button.defaultProps = {
    visible: true,
    size: "regular",
    color: "blue",
};

export default Button;
