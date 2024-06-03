import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
} from '@ionic/react';

import React from 'react';

import { useLocation } from 'react-router-dom';
import { archiveOutline, archiveSharp, bookmarkOutline, cloudDownloadOutline, cloudDownloadSharp, heartOutline, heartSharp, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, trashOutline, trashSharp, warningOutline, warningSharp } from 'ionicons/icons';
import './Menu.css';
import RecetaBcData from '../service/RecetaBcData';
import Profile from '../model/Profile';
import { useState, useEffect } from 'react';
import NewProfileButton from './NewProfileButton';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Ingresos',
    url: '/folder/Inbox ',
    iosIcon: cloudDownloadOutline,
    mdIcon: cloudDownloadSharp
  },
  {
    title: 'Envíos',
    url: '/folder/Outbox',
    iosIcon: paperPlaneOutline,
    mdIcon: paperPlaneSharp
  },
  {
    title: 'Favoritos',
    url: '/folder/Favorites',
    iosIcon: heartOutline,
    mdIcon: heartSharp
  },
  {
    title: 'Archivados',
    url: '/folder/Archived',
    iosIcon: archiveOutline,
    mdIcon: archiveSharp
  },
  {
    title: 'Papelera',
    url: '/folder/Trash',
    iosIcon: trashOutline,
    mdIcon: trashSharp
  }
];

const labels:string[] = ['Familia', 'Amigos']

const Menu: React.FC = () => {
  const location = useLocation()
  const data = RecetaBcData.getInstance()
  const [currentProfile, setCurrentP] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    data.getProfiles().then((p) => {
      setProfiles(p);
    });

    const subscription = data.getCurrentProfile().subscribe((p) => {
      if (currentProfile?.didId !== p?.didId) {
        setCurrentP(p);
      }
    });

    // Limpiar la suscripción cuando el componente se desmonte
    return () => subscription.unsubscribe();
  }, [currentProfile]);

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
    </IonMenu>)
  }

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>Recetas</IonListHeader>
          <IonNote>{currentProfile.name}</IonNote>
          <NewProfileButton />
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                  <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

        <IonList id="labels-list">
          <IonListHeader>Etiquetas</IonListHeader>
          {labels.map((label, index) => (
            <IonItem lines="none" key={index}>
              <IonIcon aria-hidden="true" slot="start" icon={bookmarkOutline} />
              <IonLabel>{label}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
