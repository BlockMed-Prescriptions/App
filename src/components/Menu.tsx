import {
  IonBadge,
  IonContent,
  IonFooter,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonText,
  IonTitle,
} from '@ionic/react';

import React, { useRef } from 'react';

import { useLocation } from 'react-router-dom';
import './Menu.css';
import RecetaBcData, { RecetaFolder } from '../service/RecetaBcData';
import Profile from '../model/Profile';
import { useState, useEffect } from 'react';
import NewProfileButton from './NewProfileButton';
import {version as recetasBcVersion} from '../version';
import { MessageStatus } from '../message/MessageReceiver';

import { AppPage, appPagesInit } from '../service/MenuProvider';
import { warningOutline, wifiOutline } from 'ionicons/icons';
import ProfileHandler from '../service/ProfileHandler';


const Menu: React.FC = () => {
  const location = useLocation()
  const data = RecetaBcData.getInstance()
  const [connectionStatus, setConnectionStatus] = useState<number>(200)
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [appPages, setAppPages] = useState<AppPage[]>(appPagesInit);
  const menuElement = useRef<HTMLIonMenuElement>(null);

  useEffect(() => {
    const subscription = data.observeProfile().subscribe((p) => {
      //if (!currentProfile || currentProfile?.didId !== p?.didId) {
        setCurrentProfile(p);
        // cambiando el perfil, entonces
        console.log("Cambiando el perfil", p)
      //}
    })
    setCurrentProfile(data.getCurrentProfile())

    // Limpiar la suscripción cuando el componente se desmonte
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = MessageStatus().subscribe((status) => {
      console.log("Cambiando el estado de la conexión", status)
      setConnectionStatus(status);
    })

    return () => subscription.unsubscribe();
  }, [])

  const refreshRecetas = async (folder: RecetaFolder|null) => {
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
      refreshRecetas(f).then(() => {}); 
    });

    return () => {
      suscription.unsubscribe();
    }
  }, [currentProfile])

  useEffect(() => {
    refreshRecetas(null).then(() => {});
  }, [currentProfile])

  const footer = (
    <IonFooter>
        <IonText style={{"fontSize": "80%"}} className='ion-padding' color="medium">
          <IonIcon icon={connectionStatus === 200 ? wifiOutline : warningOutline} color={connectionStatus === 200 ? "success" : "danger"} />
          Versión {recetasBcVersion}
        </IonText>
    </IonFooter>
  )

  if (!currentProfile) {
    return (<IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>Recetas</IonListHeader>
          <IonNote style={{"marginRight": "20px"}}>
            No hay un perfil actualmente definido, puede crear uno nuevo.
            <NewProfileButton />
          </IonNote>
        </IonList>
      </IonContent>
      {footer}
    </IonMenu>)
  }

  return (
    <IonMenu contentId="main" type="overlay" ref={menuElement}>
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>Recetas</IonListHeader>
          <IonNote>{currentProfile?.name}</IonNote>
          <NewProfileButton onSelect={(profile) => menuElement.current?.close()}/>
          {appPages.map((appPage, index) => {
            let title: string = appPage.title;
            if (!appPage.roles.includes(currentProfile?.roles[0] ?? '')) {
              return null;
            }
            
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                  <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  <IonLabel>{title}</IonLabel>
                  {appPage.count && appPage.count > 0 ? (<IonBadge slot="end">{appPage.count}</IonBadge>) : null}
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>
      </IonContent>
      {footer}
    </IonMenu>
  );
};

export default Menu;
