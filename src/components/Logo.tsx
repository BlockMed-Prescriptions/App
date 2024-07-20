import React from 'react'
import styled from 'styled-components'
import logo from "../assets/logo.png"

interface LogoTypes {
    size?: string,
    name?: boolean,
    titleSize?: string
    gap?: string
}

const Logo: React.FC<LogoTypes> = ({ size, name = false, titleSize, gap }) => {
    return (
        <LogoStyled titleSize={titleSize} size={size} gap={gap}>
            <img src={logo} />
            {name &&
                <p>{"BlockMed"}</p>
            }
        </LogoStyled>
    )
}

export default Logo

interface LogoStyledTypes {
    size?: string,
    titleSize?: string
    gap?: string
}

const LogoStyled = styled.div<LogoStyledTypes>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${(prop) => prop.gap || "1em"};
    img{
        width: ${(prop) => prop.size || "8em"};
        height: auto;
    }
    p{
        color: #4181F5;
        font-size: ${(prop) => prop.titleSize || "2.5em"};
        margin: 0;
        font-weight: 500;
     }
`