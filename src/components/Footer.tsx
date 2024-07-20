import { IonFooter } from '@ionic/react'
import React from 'react'
import styled from 'styled-components'
import { version as recetasBcVersion } from '../version';
import { useLocation } from 'react-router';

interface FooterTypes {

}
const hiddePathnames = ["/init", "/"]

const Footer: React.FC<FooterTypes> = ({ }) => {
    const location = useLocation()
    if (hiddePathnames.includes(location.pathname)) {
        return <></>
    }
    return (
        <FootesStyled>
            <p className='date'>
                {new Date().toLocaleString('es', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
            </p>
            <p className='version'>
                Versión {recetasBcVersion}
            </p>
        </FootesStyled>
    )
}

export default Footer

const FootesStyled = styled(IonFooter)`
    position: fixed;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 0.45em 2em 0.45em 2em;
    .date{
        background: transparent;
        color: #000;
    }
    .version{
        background: transparent;
        color: #000;
        opacity: 60%;
        font-size: 0.8em;
    }
`