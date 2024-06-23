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
} from '@ionic/react';

import React, { useRef } from 'react';

import { useLocation } from 'react-router-dom';
import { archiveOutline, archiveSharp, bookmarkOutline, cloudDownloadOutline, cloudDownloadSharp, heartOutline, heartSharp, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, trashOutline, trashSharp, warningOutline, warningSharp } from 'ionicons/icons';
import './Menu.css';
import RecetaBcData, { RECETA_FOLDER_ARCHIVED, RECETA_FOLDER_FAVORITOS, RECETA_FOLDER_INBOX, RECETA_FOLDER_OUTBOX, RECETA_FOLDER_PAPELERA, RecetaFolder } from '../service/RecetaBcData';
import Profile from '../model/Profile';
import { useState, useEffect } from 'react';
import NewProfileButton from './NewProfileButton';
import {version as recetasBcVersion} from '../version';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
  folder?: string;
  count?: number;
}

const appPagesInit: AppPage[] = [
  {
    title: 'Ingresos',
    url: '/folder/Inbox ',
    iosIcon: cloudDownloadOutline,
    mdIcon: cloudDownloadSharp,
    folder: RECETA_FOLDER_INBOX
  },
  {
    title: 'Envíos',
    url: '/folder/Outbox',
    iosIcon: paperPlaneOutline,
    mdIcon: paperPlaneSharp,
    folder: RECETA_FOLDER_OUTBOX
  },
  {
    title: 'Favoritos',
    url: '/folder/Favorites',
    iosIcon: heartOutline,
    mdIcon: heartSharp,
    folder: RECETA_FOLDER_FAVORITOS
  },
  {
    title: 'Archivados',
    url: '/folder/Archived',
    iosIcon: archiveOutline,
    mdIcon: archiveSharp,
    folder: RECETA_FOLDER_ARCHIVED
  },
  {
    title: 'Papelera',
    url: '/folder/Trash',
    iosIcon: trashOutline,
    mdIcon: trashSharp,
    folder: RECETA_FOLDER_PAPELERA
  }
];

const Menu: React.FC = () => {
  const location = useLocation()
  const data = RecetaBcData.getInstance()
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
    console.log("Para el perfil actual", data.getCurrentProfile())
    setCurrentProfile(data.getCurrentProfile())
    console.log("Para el perfil actual", currentProfile)

    // Limpiar la suscripción cuando el componente se desmonte
    return () => subscription.unsubscribe();
  }, []);

  const refreshRecetas = async (folder: RecetaFolder|null) => {
    for (let page of appPagesInit) {
      if (folder && page.folder !== folder) {
        continue;
      }
      page.count = 0;
      if (page.folder && currentProfile) {
        const r = await data.getRecetasFromFolder(page.folder as RecetaFolder)
        page.count = r.length;
        console.log("para la carpeta", page.folder, "hay", r.length, "recetas"  )
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
    <IonMenu contentId="main" type="overlay" ref={menuElement}>
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>Recetas</IonListHeader>
          <IonNote>{currentProfile?.name}</IonNote>
          <NewProfileButton onSelect={(profile) => menuElement.current?.close()}/>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                  <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
                  {appPage.count && appPage.count > 0 ? (<IonBadge slot="end">{appPage.count}</IonBadge>) : null}
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>
      </IonContent>
      <IonFooter>
          <IonText style={{"fontSize": "80%"}} className='ion-padding' color="medium">Versión {recetasBcVersion}</IonText>
      </IonFooter>
    </IonMenu>
  );
};

export default Menu;
