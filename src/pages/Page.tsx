import { IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import ExploreContainer from '../components/ExploreContainer';
import './Page.css';
import { useEffect, useState } from 'react';
import Profile from '../model/Profile';
import RecetaBcData, { RECETA_FOLDER_ARCHIVED, RECETA_FOLDER_FAVORITOS, RECETA_FOLDER_INBOX, RECETA_FOLDER_OUTBOX, RECETA_FOLDER_PAPELERA, RecetaFolder } from '../service/RecetaBcData';
import ProfileHandler from '../service/ProfileHandler';
import { add } from 'ionicons/icons';
import Receta from '../model/Receta';

const FolderConversion: { [key: string]: RecetaFolder } = {
  "Outbox": RECETA_FOLDER_OUTBOX,
  "Inbox": RECETA_FOLDER_INBOX,
  "Trash": RECETA_FOLDER_PAPELERA,
  "Archived": RECETA_FOLDER_ARCHIVED,
  "Favorites": RECETA_FOLDER_FAVORITOS
}

const Page: React.FC = () => {

  const { name } = useParams<{ name: string; }>();
  const data = RecetaBcData.getInstance();

  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [recetas, setRecetas] = useState<Receta[]>([]);

  const refreshRecetas = (folder: RecetaFolder) => {
    data.getRecetasFromFolder(folder).then((recetas) => {
        setRecetas(recetas);
    });
}


  useEffect(() => {
    data.observeProfile().subscribe((p) => {
        if (currentProfile?.didId !== p?.didId) {
            setCurrentProfile(p);
        }
    })
  })

  useEffect(() => {
      let recetaFolder = FolderConversion[name.trim()];
      if (!recetaFolder) {
          console.log(FolderConversion)
          throw new Error(`Folder ${name}. not found`);
      }

      setTimeout(() => {
          refreshRecetas(recetaFolder);
      })

      console.log("Suscribiendo a cambios en la carpeta", recetaFolder)
      const suscriptor = data.observeFolders().subscribe((folder) => {
          if (folder === recetaFolder) {
              console.log('folder', folder);
              refreshRecetas(recetaFolder);
          }
      });

      return () => {
          suscriptor.unsubscribe();
      }
  }, [name]);


  return (
      <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonMenuButton />
              </IonButtons>
              <IonTitle>{name}</IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent fullscreen>
            <IonHeader collapse="condense">
              <IonToolbar>
                <IonTitle size="large">{name}</IonTitle>
              </IonToolbar>
            </IonHeader>
            <ExploreContainer name={name} recetas={recetas} />
            {currentProfile && ProfileHandler.isMedico(currentProfile) && 'Outbox' === name ? (
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton routerLink="/receta/new">
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            ) : null}
        </IonContent>
      </IonPage>
  );
};

export default Page;
