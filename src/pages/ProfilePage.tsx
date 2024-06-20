import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { default as ProfileModel } from '../model/Profile';
import RecetaBcData from '../service/RecetaBcData';
import { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, useIonAlert, IonIcon, useIonToast, IonModal } from '@ionic/react';
import { DIDResolver } from '../quarkid/DIDResolver';
import { codeOutline, copyOutline, medalOutline, qrCodeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import ModalCertificado, { HTMLModalCertificado } from '../components/ModalCertificado';
import QRCode from 'react-qr-code';
import ProfileHandler from '../service/ProfileHandler';

const ProfilePage: React.FC = () => {
    const data = RecetaBcData.getInstance();
    const [currentProfile, setCurrentProfile] = useState<ProfileModel | null>(null);
    const [didDocument, setDidDocument] = useState<any | null>(null);
    const [qrValue, setQrValue] = useState<string>('');
    const [presentAlert] = useIonAlert();
    const [presentToast] = useIonToast();
    const modal = useRef<HTMLIonModalElement>(null);
    const history = useHistory();
    const modalCertificado = useRef<HTMLModalCertificado>(null);

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
        if (currentProfile) {
            setQrValue(ProfileHandler.toQrCode(currentProfile));
        }
    }, [currentProfile]);

    useEffect(() => {
        setCurrentProfile(data.getCurrentProfile())
        const subscription = data.observeProfile().subscribe((p) => {
            setCurrentProfile(p);
        });
    
        // Limpiar la suscripción cuando el componente se desmonte
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (currentProfile) {
            getDidDocument(currentProfile);
        }
    }, [currentProfile]);

    const dismiss = () => {
        modal.current?.dismiss();
    }


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
                            <IonButtons slot="end">
                                <IonButton size="small" onClick={() => {
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
                                {didDocument ? (
                                <IonButton size="small" onClick={() => modalCertificado.current?.open()}>
                                    <IonIcon icon={medalOutline} slot="icon-only" />
                                </IonButton>
                                ) : ''}
                                <ModalCertificado ref={modalCertificado} certificado={didDocument} />
                            </IonButtons>
                        ) : ''}
                    </IonItem>
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
                <IonButton color="light" onClick={() => {
                    modal.current?.present();
                }}>
                    QR
                    <IonIcon icon={qrCodeOutline} slot='start' />
                </IonButton>

                <IonModal ref={modal}>
                    <IonHeader>
                        <IonToolbar>
                            <IonButtons slot="end">
                                <IonButton onClick={() => dismiss()}>Cerrar</IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent fullscreen={true} className="ion-padding ion-text-center">
                        <QRCode value={qrValue} size={320} />
                    </IonContent>
                </IonModal>
            </IonContent>
        </IonPage>
    )
}


export default ProfilePage;