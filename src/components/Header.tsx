import { IonHeader, IonIcon, IonMenuButton } from '@ionic/react'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { MessageStatus } from '../message/MessageReceiver';
import { addOutline, refreshOutline, warningOutline, wifiOutline } from 'ionicons/icons';
import { useCurrentProfile } from '../hooks';
import Button from './Button';
import { useHistory, useLocation } from 'react-router';
import usePlatforms from '../hooks/usePlatforms';
import ProfileButton from './ProfileButton';

interface HeaderTypes {
}
const hiddePathnames = ["/init", "/"]

const Header: React.FC<HeaderTypes> = ({ }) => {
    const [connectionStatus, setConnectionStatus] = useState<number>(200)
    const history = useHistory();
    const { currentProfile } = useCurrentProfile();
    const { isMobile } = usePlatforms();
    const location = useLocation()
    useEffect(() => {
        const subscription = MessageStatus().subscribe((status) => {
            console.log("Cambiando el estado de la conexión", status)
            setConnectionStatus(status);
        })

        return () => subscription.unsubscribe();
    }, [])

    const isMed = useMemo(() => {
        if (!currentProfile) return ""
        const role = currentProfile?.roles[0]
        return role === "med"
    }, [currentProfile])

    if (hiddePathnames.includes(location.pathname)) {
        return <></>
    }

    return (
        <HeaderStyled>
            {isMobile ?
                <IonMenuButton color="dark" /> : <div></div>
            }
            <div className='header-actions'>
                <ProfileButton name={currentProfile?.name || ""} to="/profile" />
                <div className='button-navbar' onClick={() => window.location.reload()}>
                    <IonIcon icon={refreshOutline} color="dark" />
                </div>
                <div className='button-navbar'>
                    <IonIcon icon={connectionStatus === 200 ? wifiOutline : warningOutline} color={connectionStatus === 200 ? "success" : "danger"} />
                </div>
                {isMed &&
                    <Button onClick={() => history.push("/new_receipt")} padding="0.8em 2.5em 0.8em 2.5em" >
                        <div className='button-new-receipt'>
                            <IonIcon icon={addOutline} />
                            {!isMobile &&
                                <p>{"Nueva Receta"}</p>
                            }
                        </div>
                    </Button>
                }
            </div>
        </HeaderStyled>
    )
}


export default Header

const HeaderStyled = styled(IonHeader)`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.45em 2em 0.45em 2em;
    background: #fff;
    @media (max-width:500px){
        padding: 0.45em 1em 0.45em 1em;
    }
    @media (min-width:500px){
            padding: 0.45em 2em 0.45em 2em;
        }
    
.header-actions{

    display: flex;
    align-items: center;
    justify-content: end;
    gap: 1em;
    .button-new-receipt{
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1em;
        p{
            margin: 0;
        }
    }
    .button-user{
        cursor: pointer;
        background-color: var(--ion-color-light);
        padding: 0.8em;
        border-radius: 100px;
        border: 1px solid var(--ion-color-primary);
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.8em;
        p{
            color: var(--ion-color-primary);
            margin: 0;
        }
    }
    .button-navbar{
        cursor: pointer;
        background-color: var(--ion-color-light);
        padding: 0.5em;
        border-radius: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.3em;
    }
}
    `