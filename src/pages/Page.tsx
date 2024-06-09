import { IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import ExploreContainer from '../components/ExploreContainer';
import './Page.css';
import { useEffect, useState } from 'react';
import Profile from '../model/Profile';
import RecetaBcData from '../service/RecetaBcData';
import ProfileHandler from '../service/ProfileHandler';
import { add } from 'ionicons/icons';

const Page: React.FC = () => {

  const { name } = useParams<{ name: string; }>();
  const data = RecetaBcData.getInstance();

  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  useEffect(() => {
    data.observeProfile().subscribe((p) => {
        if (currentProfile?.didId !== p?.didId) {
            setCurrentProfile(p);
        }
    })
  })

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
            <ExploreContainer name={name} />
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
