import React, { useMemo } from 'react'
import styled from 'styled-components'

interface ButtonType {
    type?: "primary" | "clear-cancel" | "primary-outline",
    fill?: string,
    onClick?: () => void,
    label?: string,
    padding?: string
    size?: string,
    children?: JSX.Element,
    fullWidth?: boolean
}

const Button: React.FC<ButtonType> = ({ type = "primary", onClick = () => { }, label, fill, children, ...props }) => {
    const buttonProps = useMemo(() => {
        if (type === "primary") return { bg: "#4181F5", text: "#fff" }
        if (type === "clear-cancel") return { bg: "transparent", text: "#000" }
        if (type === "primary-outline") return { bg: "transparent", text: "#4181F5", border: "#4181F5" }
    }, [type])
    return (
        <ButtonStyled onClick={onClick} {...props} {...buttonProps} >{children ? children : label}</ButtonStyled>
    )
}

export default Button

interface ButtonStyledType {
    fullWidth?: boolean
    padding?: string,
    size?: string,
    bg?: string,
    text?: string,
    border?: string
}

const ButtonStyled = styled.button <ButtonStyledType>`
    padding: ${(prop) => prop.padding || "0.8em 2em 0.8em 2em"};
    font-size: ${(prop) => prop.size || "1em"};
    border: ${(prop) => prop.border ? `1px solid ${prop.border}` : "none"};
    width: ${(prop) => prop.fullWidth ? "100%" : "fit-content"};
    border-radius: 5px;
    background: ${(prop) => prop.bg || "#4181F5"};
    color: ${(prop) => prop.text || "#fff"};
    font-weight: 500;
`