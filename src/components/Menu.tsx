import {
  IonBadge,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonModal,
  IonNote,
} from '@ionic/react';

import React, { useRef } from 'react';

import { useLocation } from 'react-router-dom';
import './Menu.css';
import RecetaBcData, { RecetaFolder } from '../service/RecetaBcData';
import Profile from '../model/Profile';
import { useState, useEffect } from 'react';

import { AppPage, appPagesInit } from '../service/MenuProvider';
import Logout from './Logout';
import { useCurrentProfile } from '../hooks';
import styled from 'styled-components';
import Logo from './Logo';
import Divider from './Divider';
import Button from './Button';
import { qrCodeOutline } from 'ionicons/icons';
import QRCode from 'react-qr-code';
import ProfileHandler from '../service/ProfileHandler';

const hiddePathnames: string[] = ["/", "/init"]


const Menu: React.FC = () => {
  const location = useLocation()
  const data = RecetaBcData.getInstance()
  const { currentProfile } = useCurrentProfile();
  const [appPages, setAppPages] = useState<AppPage[]>(appPagesInit);
  const menuElement = useRef<HTMLIonMenuElement>(null);

  const refreshRecetas = async (folder: RecetaFolder | null) => {
    for (let page of appPagesInit) {
      if (folder && page.folder !== folder) {
        continue;
      }
      page.count = 0;
      if (page.folder && currentProfile) {
        const r = await data.getRecetasFromFolder(page.folder as RecetaFolder)
        page.count = r.length;
      };
    }
    const appPagesInitCopy = JSON.parse(JSON.stringify(appPagesInit));
    setAppPages(appPagesInitCopy);
  }

  useEffect(() => {
    const suscription = data.observeFolders().subscribe((f) => {
      refreshRecetas(f).then(() => { });
    });

    return () => {
      suscription.unsubscribe();
    }
  }, [currentProfile])

  const [qrValue, setQrValue] = useState<string>('');
  const modal = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    refreshRecetas(null).then(() => { });
    if (currentProfile) {
      setQrValue(ProfileHandler.toQrCode(currentProfile));
    }
  }, [currentProfile])


  if (hiddePathnames.includes(location.pathname)) {
    return <></>
  }

  if (!currentProfile) {
    return (<IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>Recetas</IonListHeader>
          <IonNote style={{ "marginRight": "20px" }}>
            No hay un perfil actualmente definido, puede crear uno nuevo.
          </IonNote>
        </IonList>
      </IonContent>
      <Logout />
    </IonMenu>)
  }


  return (
    <IonMenu contentId="main" type="overlay" ref={menuElement}>
      <MenuStyled>
        <Logo name size="5em" titleSize='1.5em' gap="0.5em" />
        <div className='menu-pages'>
          {appPages.map((appPage, index) => {
            let title: string = appPage.title;
            let isSelected = ""
            if (!location.search && location.pathname === appPage.pathname) {
              isSelected = 'selected'
            }
            if (location.search && `${location.pathname}${location.search}` === appPage.url) {
              isSelected = 'selected'
            }
            if (!appPage.roles.includes(currentProfile?.roles[0] ?? '')) {
              return null;
            }

            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={isSelected} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                  <IonIcon aria-hidden="true" color="dark" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  <IonLabel>{title}</IonLabel>
                  {appPage.count && appPage.count > 0 ? (<IonBadge slot="end">{appPage.count}</IonBadge>) : null}
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </div>
        <div className='divider-about'>
          <Divider px="0" />
          <p>{"Acerca de BlockMed"}</p>
        </div>
        <Button onClick={() => modal.current?.present()} type="primary-outline" fullWidth padding="0.8em 0em 0.8em 0em" >
          <div className='button-qr'>
            <IonIcon icon={qrCodeOutline} />
            <span>{"Mi código QR"}</span>
          </div>
        </Button>
        <IonModal ref={modal} initialBreakpoint={0.50} breakpoints={[0, 0.25, 0.5, 0.75]}>
          <QRCodeStyled>
            <QRCode value={qrValue} size={320} />
          </QRCodeStyled>
        </IonModal>
        <Logout />
      </MenuStyled>
    </IonMenu>
  );
};

export default Menu;

const QRCodeStyled = styled.div`
display: flex;
justify-content: center;
padding: 5em 0 0 0;
align-items: center;
`

const MenuStyled = styled.div`
  height: 100%;
  padding: 3em 2em 3em 2em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  ion-modal{
    width: 40em;
  }
  .divider-about{
    width: 100%;
    color: #000;
    font-weight: 500;
  }
  .button-qr{
    width: 100%;
    gap: 1em;
    height: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    ion-icon{
      font-size: 1.5em;
    }
  }
  .menu-pages{
    width: 100%;
    display: flex;
    gap: 1em;
    flex-direction: column;
    ion-menu-toggle{
      width: 100%;
    }
  }
`
