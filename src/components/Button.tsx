import { IonSpinner } from '@ionic/react'
import React, { useMemo } from 'react'
import styled from 'styled-components'

interface ButtonType {
    type?: "primary" | "clear-cancel" | "primary-outline" | "primary-outline-opac" | "cancel",
    fill?: string,
    onClick?: () => void,
    label?: string,
    padding?: string
    size?: string,
    children?: JSX.Element,
    fullWidth?: boolean
    loading?: boolean
}

const Button: React.FC<ButtonType> = ({ type = "primary", onClick = () => { }, label, fill, loading, children, ...props }) => {
    const buttonProps = useMemo(() => {
        if (type === "primary") return { bg: "#4181F5", text: "#fff" }
        if (type === "clear-cancel") return { bg: "transparent", text: "#000" }
        if (type === "primary-outline") return { bg: "transparent", text: "#4181F5", border: "#4181F5" }
        if (type === "primary-outline-opac") return { bg: "var(--ion-color-light)", text: "#4181F5", border: "#4181F5" }
        if (type === "cancel") return { bg: "#cb1a27", text: "#FFFFF", border: "#cb1a27" }
    }, [type])
    return (
        <ButtonStyled onClick={loading ? () => { } : onClick} {...props} {...buttonProps} >
            {loading && <IonSpinner></IonSpinner>}
            {children && !loading ? children : label}
        </ButtonStyled>
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

    @media (max-width:500px){
        padding: ${(prop) => prop.padding || "0.8em 1em 0.8em 1em"};
        font-size: ${(prop) => prop.size || "0.8em"};
    }
    @media (min-width:500px){
        padding: ${(prop) => prop.padding || "0.8em 2em 0.8em 2em"};
        font-size: ${(prop) => prop.size || "1em"};
    }
    border: ${(prop) => prop.border ? `1px solid ${prop.border}` : "none"};
    width: ${(prop) => prop.fullWidth ? "100%" : "fit-content"};
    border-radius: 5px;
    background: ${(prop) => prop.bg || "#4181F5"};
    color: ${(prop) => prop.text || "#fff"};
    font-weight: 500;
    ion-spinner{
        
    }
`