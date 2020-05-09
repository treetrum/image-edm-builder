import * as React from "react";

interface PropsType {
    visible?: boolean;
    children: React.ReactChild;
    size?: "small" | "regular";
    color?: "red" | "blue";
    disabled?: boolean;
}

const Button: React.FC<
    PropsType &
        React.DetailedHTMLProps<
            React.AnchorHTMLAttributes<HTMLAnchorElement>,
            HTMLAnchorElement
        >
> = ({ visible, children, size, color, className, ...props }) => {
    if (!visible) return null;
    return (
        <a
            className={`button button--${size} button--${color} ${className}`}
            {...props}
        >
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
