import { IonIcon } from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import React from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'
import RecetaBcData from '../service/RecetaBcData';

const Logout: React.FC = () => {
    const history = useHistory();
    const data = RecetaBcData.getInstance()
    return (
        <LogOutStyled onClick={() => {
            data.setCurrentProfile(null)
            history.push("/")
        }}>
            <div className='logout-container'>
                <IonIcon icon={logOutOutline} />
                <p>{"Cerrar Sesion"}</p>
            </div>
        </LogOutStyled>
    )
}

export default Logout

const LogOutStyled = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    .logout-container{
        font-size: 1.4em;
        gap: 0.5em;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        color: var(--ion-color-primary);
        p{
            font-size: 0.9em;
            margin: 0;
            @media (max-width:500px){
                font-size: 0.7em !important;
        }
        }
    }
`