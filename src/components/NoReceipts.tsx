import React, { useMemo } from 'react'
import styled from 'styled-components'
import noInfoDoctor from "../assets/noInfoDoctor.png"
import noInfofarmacy from "../assets/noInfoFarmacy.png"
import noInfoPacient from "../assets/noInfoPacient.png"


interface NoReceiptsTypes {
    type: string,
    text: string[]
}

const NoReceipts: React.FC<NoReceiptsTypes> = ({ type, text }) => {
    const image = useMemo(() => {
        if (type === "med") return noInfoDoctor
        if (type === "far") return noInfofarmacy
        if (type === "pac") return noInfoPacient
    }, [type])
    return (
        <NoReceiptsStyled type={type}>
            {/* <div style={{ backgroundImage: `url(${type === "doc" ? noInfoDoctor : noInfofarmacy})` }} className='no-values-img'></div> */}
            {image &&
                <img src={image} />
            }
            {text.map((t) =>
                <p className='no-values-text'>{t}</p>
            )}
        </NoReceiptsStyled>
    )
}

export default NoReceipts

const NoReceiptsStyled = styled.div<{ type: string }>`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    img{
        object-fit: cover;
        height: auto;
        width: 15em;
    }
    .no-values-text{
        color: var(--ion-color-success-contrast);
        @media (max-width:500px){
            font-size: 1em;
        }
        @media (min-width:500px){
            font-size: 1.2em;
        }
        text-align: center;
        margin: 0;
    }
`   