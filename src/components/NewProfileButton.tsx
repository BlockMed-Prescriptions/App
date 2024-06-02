import { useState } from 'react';
import RecetaBcData from '../service/RecetaBcData';
import Profile from '../model/Profile';
import { IonFab, IonFabButton, IonIcon, useIonActionSheet } from '@ionic/react';
import { add, peopleCircleOutline, personOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const NewProfileButton: React.FC = () => {
    const data = RecetaBcData.getInstance();
    const history = useHistory();
    const [present] = useIonActionSheet();

    const perfilActionSheet = () => {
        data.getProfiles().then((profiles) => {
            const buttons = profiles.map((profile: Profile) => {
                return {
                    text: profile.name,
                    role: 'destructive',
                    icon: personOutline,
                    handler: () => {
                        data.setCurrentProfile(profile);
                        history.push('/folder/Inbox');
                    }
                }
            })
            buttons.push({
                text: 'Nuevo Perfil',
                role: 'destructive',
                icon: add,
                handler: () => {
                    history.push('/profile/new');
                }
            });

            present({
                "header": "Perfiles", 
                "subHeader": "Seleccione un perfil",
                buttons: buttons,
            })
        });
    }

    return (
        <IonFab horizontal="end" vertical="top">
            <IonFabButton size="small" color="light" onClick={() => perfilActionSheet()}>
                <IonIcon icon={personOutline}></IonIcon>
            </IonFabButton>
      </IonFab>
    )
}

export default NewProfileButton;
