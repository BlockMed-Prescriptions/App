import React from "react";
import styled from "styled-components";

interface DividerTypes {
    color?: string,
    opacity?: boolean,
    px?: string,
    py?: string,
}

const Divider: React.FC<DividerTypes> = (props) => {
    return (
        <DividerStyled {...props} >
            <div
                className="divider"
            ></div>
        </DividerStyled>
    );
};


interface DividerStyledTypes {
    color?: string,
    opacity?: boolean,
    px?: string,
    py?: string,
}

export default Divider;

const DividerStyled = styled.div<DividerStyledTypes>`
    padding-top: ${(prop) => prop.py || "1em"};
    padding-bottom: ${(prop) => prop.py || "1em"};
    padding-left: ${(prop) => prop.px || "1em"};
    padding-right: ${(prop) => prop.px || "1em"};
    width: 100%;
    .divider{
        background: ${(prop) => prop.color || "#e6e6e6"};
        height: 2px;
        opacity: ${(prop) => prop.opacity ? ".5" : "1"};
    }
`