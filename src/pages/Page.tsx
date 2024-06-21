import { IonButtons, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonMenuButton, IonPage, IonRow, IonTitle, IonToolbar, useIonAlert, useIonToast } from '@ionic/react';
import { useParams } from 'react-router';
import './Page.css';
import { useEffect, useRef, useState } from 'react';
import Profile from '../model/Profile';
import RecetaBcData, { RECETA_FOLDER_ARCHIVED, RECETA_FOLDER_FAVORITOS, RECETA_FOLDER_INBOX, RECETA_FOLDER_OUTBOX, RECETA_FOLDER_PAPELERA, RecetaFolder } from '../service/RecetaBcData';
import ProfileHandler from '../service/ProfileHandler';
import { add } from 'ionicons/icons';
import Receta from '../model/Receta';
import RecetaCard from '../components/RecetaCard';
import RecetaSender, { HTMLRecetaSender } from '../components/RecetaSender';

const FolderConversion: { [key: string]: RecetaFolder } = {
  "Outbox": RECETA_FOLDER_OUTBOX,
  "Inbox": RECETA_FOLDER_INBOX,
  "Trash": RECETA_FOLDER_PAPELERA,
  "Archived": RECETA_FOLDER_ARCHIVED,
  "Favorites": RECETA_FOLDER_FAVORITOS
}

const getCurrentFolder = (name: string): RecetaFolder => {
  return FolderConversion[name.trim()];
}

const Page: React.FC = () => {

  const { name } = useParams<{ name: string; }>();
  const data = RecetaBcData.getInstance()
  const [presentAlert, dismissAlert] = useIonAlert();
  const [presentToast, dismissToast] = useIonToast();

  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const  recetaSender = useRef<HTMLRecetaSender>(null);

  useEffect(() => {
    setCurrentProfile(data.getCurrentProfile());
    const s = data.observeProfile().subscribe((p) => {
        setCurrentProfile(p);
        refreshRecetas(FolderConversion[name.trim()]);
    })

    return () => {
        s.unsubscribe()
    }
  }, [])

  useEffect(() => {
      let recetaFolder = getCurrentFolder(name);
      if (!recetaFolder) {
          throw new Error(`Folder ${name}. not found`);
      }

      setTimeout(() => {
          if (currentProfile) {
              refreshRecetas(recetaFolder);
          }
      })

      const suscriptor = data.observeFolders().subscribe((folder) => {
          if (folder === recetaFolder) {
              refreshRecetas(recetaFolder);
          }
      });

      return () => {
          suscriptor.unsubscribe();
      }
  }, [name, currentProfile]);


  const refreshRecetas = (folder: RecetaFolder) => {
    if (!currentProfile) {
        setRecetas([]);
        return;
    }
    data.getRecetasFromFolder(folder).then((recetas) => {
        setRecetas(recetas);
    });
  }

  const sendReceta = (receta: Receta) => {
      if (!currentProfile) {
          return;
      }
      recetaSender.current?.send(receta);
      //recetaService.sendReceta(currentProfile!, receta);
  }

  const canSendArchive = () : boolean => {
      let recetaFolder = getCurrentFolder(name);
      return recetaFolder === RECETA_FOLDER_INBOX || recetaFolder === RECETA_FOLDER_OUTBOX;
  }

  const canDelete = () : boolean => {
      let recetaFolder = getCurrentFolder(name);
      return recetaFolder !== RECETA_FOLDER_PAPELERA;
  }

  const sendArchive = (receta: Receta) => {
      if (!currentProfile) {
          return;
      }
      data.moveRecetaToFolder(receta, getCurrentFolder(name), RECETA_FOLDER_ARCHIVED);
  }

  const toggleFavorite = (receta: Receta) => {
      if (!currentProfile) {
          return;
      }
      data.getRecetasFromFolder(RECETA_FOLDER_FAVORITOS).then((recetas) => {
          if (recetas.find((r) => r.id === receta.id)) {
              data.removeRecetaFromFolder(receta, RECETA_FOLDER_FAVORITOS);
              receta.enCarpetaFavoritos = false
          } else {
              data.addRecetaToFolder(receta, RECETA_FOLDER_FAVORITOS);
              receta.enCarpetaFavoritos = true
          }
          console.log("Estoy actualizando las recetas")
          setRecetas(prevRecetas => prevRecetas.map((r) => r.id === receta.id ? receta : r))
      })
  }

  const deleteReceta = (receta: Receta) => {
      if (!currentProfile) {
          return;
      }
      presentAlert({
          "message": "¿Está seguro de que quiere eliminar la receta?",
          "header": "Eliminar Receta",
          "buttons": [
              "Cancelar",
              {
                  text: "Eliminar",
                  handler: () => {
                      data.moveRecetaToFolder(receta, getCurrentFolder(name), RECETA_FOLDER_PAPELERA);
                      presentToast({
                          message: "Receta eliminada",
                          duration: 1000,
                          position: 'bottom'
                      });
                  }
              }
          ]
      });
  }


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

            <IonGrid fixed={true}>
              <IonRow>
                {recetas.map((receta) => 
                  <IonCol sizeLg='6' sizeMd="6" sizeSm="12" sizeXs="12" key={receta.id}>
                    <RecetaCard receta={receta}
                      onClickSend={() => sendReceta(receta)}
                      onClickArchive={canSendArchive() ? (() => sendArchive(receta)) : undefined}
                      onClickFavorite={() => toggleFavorite(receta)}
                      onClickTrash={canDelete() ? (() => deleteReceta(receta)) : undefined}
                    />
                    
                  </IonCol>
                )}
              </IonRow>
            </IonGrid>

            {currentProfile && ProfileHandler.isMedico(currentProfile) && 'Outbox' === name ? (
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton routerLink="/receta/new">
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            ) : null}
            <RecetaSender ref={recetaSender}/>
        </IonContent>
      </IonPage>
  );
};

export default Page;
