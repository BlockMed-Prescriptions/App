import { useEffect, useState } from 'react';
import React from 'react';
import { default as ProfileModel } from '../model/Profile';
import RecetaBcData from '../service/RecetaBcData';
import { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, useIonAlert, IonIcon, useIonToast } from '@ionic/react';
import { DIDResolver } from '../quarkid/DIDResolver';
import { copyOutline } from 'ionicons/icons';

const ProfilePage: React.FC = () => {
    const data = RecetaBcData.getInstance();
    const [currentProfile, setCurrentProfile] = useState<ProfileModel | null>(null);
    const [didDocument, setDidDocument] = useState<any | null>(null);
    const [presentAlert] = useIonAlert();
    const [presentToast] = useIonToast();

    const getDidDocument = (p: ProfileModel) => {
        console.log("llamando a DIDResolver.", p)
        DIDResolver(p.didId).then((doc) => {
            setDidDocument(doc);
        }).catch((e) => {
            setDidDocument(null);
        })
    }

    const exportPerfil = (p: ProfileModel) => {
        presentAlert({
            header: 'Exportar Perfil',
            message: '¿Está seguro de que desea exportar el perfil?',
            buttons: [
                'Cancelar',
                {
                    text: 'Exportar',
                    handler: () => {
                        console.log("Exportando perfil", p);
                        /*
                        data.exportProfile(currentProfile?.didId).then((p) => {
                            console.log("Perfil exportado", p);
                        }).catch((e) => {
                            console.error("Error al exportar perfil", e);
                        });
                        */
                    }
                }
            ]
        })
    }

    useEffect(() => {
        const subscription = data.getCurrentProfile().subscribe((p) => {
            if (currentProfile?.didId !== p?.didId) {
                setCurrentProfile(p);
                console.log(p);
                if (p)
                    getDidDocument(p);
            }
        });
    
        // Limpiar la suscripción cuando el componente se desmonte
        return () => subscription.unsubscribe();
    }, [currentProfile]);
    /**
     * Dibujo la pantalla con los datos en "Profile"
     */
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                    <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Perfil de {currentProfile?.name}</IonTitle>
                </IonToolbar>
            </IonHeader>
  
            <IonContent fullscreen>
                <IonList>
                    <IonItem>
                        <IonLabel>
                            <h2>Nombre</h2>
                            <p>{currentProfile?.name}</p>
                        </IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonLabel>
                            <h2>Correo</h2>
                            <p>{currentProfile?.email}</p>
                        </IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonLabel>
                            <h2>DID</h2>
                            <p>{currentProfile?.didId}</p>
                        </IonLabel>
                        {currentProfile?.didId ? (
                            <IonButton size="small" color="light" slot="end" onClick={() => {
                                navigator.clipboard.writeText(currentProfile?.didId);
                                // acá abro un toast
                                presentToast({
                                    message: 'DID copiado al portapapeles.',
                                    duration: 1000,
                                    position: 'bottom'
                                });
                            }}>
                                <IonIcon icon={copyOutline} slot="icon-only" />
                            </IonButton>
                        ) : ''}

                    </IonItem>
                    {didDocument ? (
                    <IonItem>
                        <IonLabel>
                            <h2>Documento</h2>
                            <pre style={{"fontSize": "80%"}}>{JSON.stringify(didDocument, null, 2)}</pre>
                        </IonLabel>
                    </IonItem>
                    ) : ''}
                </IonList>
                {/*
                    Ahora voy a poner un botón para exportar el perfil
                */}
                <IonButton expand="block" onClick={() => {
                    exportPerfil(currentProfile!);
                }}
                >Exportar Perfil</IonButton>

                
            </IonContent>
        </IonPage>
    )
}


export default ProfilePage;