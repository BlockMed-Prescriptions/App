import { useEffect, useState } from 'react';
import React from 'react';
import { default as ProfileModel } from '../model/Profile';
import RecetaBcData from '../service/RecetaBcData';
import { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, useIonAlert, IonIcon, useIonToast } from '@ionic/react';
import { DIDResolver } from '../quarkid/DIDResolver';
import { copyOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';

const ProfilePage: React.FC = () => {
    const data = RecetaBcData.getInstance();
    const [currentProfile, setCurrentProfile] = useState<ProfileModel | null>(null);
    const [didDocument, setDidDocument] = useState<any | null>(null);
    const [presentAlert] = useIonAlert();
    const [presentToast] = useIonToast();
    const history = useHistory();

    const getDidDocument = (p: ProfileModel) => {
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
                        data.exportProfile(p.didId).then((p) => {
                            presentToast({
                                message: 'Perfil exportado.',
                                duration: 1000,
                                position: 'bottom'
                            });
                        }).catch((e) => {
                            presentAlert({
                                header: 'Error',
                                message: 'No se pudo exportar el perfil.',
                                buttons: ['OK']
                            });
                        });
                    }
                }
            ]
        })
    }

    const importPerfiles = () => {
        // debe presentar un cuadro para importar un archivo local
        // de la computadora. Una vez leído, se debe llamar a
        // data.importProfile(p: ProfileModel)
        let file = document.createElement('input');
        file.type = 'file';
        file.accept = 'application/json';
        file.onchange = async (e) => {
            let f = (e.target as HTMLInputElement).files![0];
            data.importProfile(f).then(() => {
                presentToast({
                    message: 'Perfil importado.',
                    duration: 1000,
                    position: 'bottom'
                });
            }).catch((msg) => {
                presentAlert({
                    header: 'Error',
                    message: 'No se pudo importar el perfil: ' + msg + '.',
                    buttons: ['OK']
                });
            });
        }

        file.click();
    }

    const deletePerfil = (p: ProfileModel) => {
        presentAlert({
            header: "Eliminar Perfil",
            message: "¿Está seguro de que desea eliminar el perfil?",
            buttons: [
                'Cancelar',
                {
                    text: 'Eliminar',
                    handler: () => {
                        data.deleteProfile(p.didId).then(() => {
                            presentToast({
                                message: 'Perfil eliminado.',
                                duration: 1000,
                                position: 'bottom'
                            });
                            data.setCurrentProfile(null);

                            // me voy al Inbox
                            history.push('/folder/Inbox');
                        }).catch((e) => {
                            presentAlert({
                                header: 'Error',
                                message: 'No se pudo eliminar el perfil.',
                                buttons: ['OK']
                            });
                        });
                    }
                }
            ]
        })
    }

    useEffect(() => {
        setCurrentProfile(data.getCurrentProfile())
        const subscription = data.observeProfile().subscribe((p) => {
            setCurrentProfile(p);
            console.log(p);
        });
    
        // Limpiar la suscripción cuando el componente se desmonte
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (currentProfile) {
            getDidDocument(currentProfile);
        }
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
                    Ahora voy a poner una botonera para importar y exportar perfiles.
                */}
                <IonButton onClick={() => {
                    exportPerfil(currentProfile!);
                }}>Exportar Perfil</IonButton>
                <IonButton onClick={() => {
                    importPerfiles();
                }}>Importar Perfil</IonButton>
                <IonButton color="danger" onClick={() => {
                    deletePerfil(currentProfile!);
                }}>Eliminar Perfil</IonButton>

                
            </IonContent>
        </IonPage>
    )
}


export default ProfilePage;