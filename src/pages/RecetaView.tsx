import { IonButton, IonButtons, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonMenuButton, IonModal, IonNote, IonPage, IonRow, IonText, IonTitle, IonToolbar, useIonAlert, useIonToast } from '@ionic/react';
import { useParams } from 'react-router';
import RecetaBcData, { RECETA_FOLDER_ARCHIVED, RECETA_FOLDER_FAVORITOS, RECETA_FOLDER_INBOX, RECETA_FOLDER_OUTBOX, RECETA_FOLDER_PAPELERA } from '../service/RecetaBcData';
import Profile from '../model/Profile';
import { useEffect, useRef, useState } from 'react';
import Receta from '../model/Receta';
import { bagAdd, checkmarkDone, copyOutline, heart, heartOutline, medalOutline, send, trash, trashOutline } from 'ionicons/icons';
import ModalCertificado, { HTMLModalCertificado } from '../components/ModalCertificado';
import { DIDResolver } from '../quarkid/DIDResolver';
import RecetaDecorator from '../receta/RecetaDecorator';

import './RecetaView.css';
import ProfileHandler from '../service/ProfileHandler';
import RecetaService from '../receta/RecetaService';
import RecetaPermisos from '../receta/RecetaPermisos';
import RecetaSender, { HTMLRecetaSender } from '../components/RecetaSender';


const RecetaView: React.FC = () => {
    const { id } = useParams<{ id: string; }>();
    const data = RecetaBcData.getInstance();
    const decorator = RecetaDecorator.getInstance();
    const recetaService = RecetaService.getInstance();
    const permisos = RecetaPermisos.getInstance();
    
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [receta, setReceta] = useState<Receta | null>(null);
    const [showSendFarmacia, setShowSendFarmacia] = useState(false);
    const [showDispensar, setShowDispensar] = useState(false);
    const [showConfirmarDispensa, setShowConfirmarDispensa] = useState(false);
    const  recetaSender = useRef<HTMLRecetaSender>(null);


    const [presentToast] = useIonToast();
    const [presentAlert] = useIonAlert();

    const modal = useRef<HTMLModalCertificado>(null);
    const modalMedico = useRef<HTMLModalCertificado>(null);
    const modalDispensa = useRef<HTMLModalCertificado>(null);
    const buttonCertificadoMedico = useRef<HTMLIonButtonElement>(null);
    const [certificadoMedico, setCertificadoMedico] = useState<any|undefined|null>(null)

    useEffect(() => {
        setCurrentProfile(data.getCurrentProfile());
        const s = data.observeProfile().subscribe((p) => {
            setCurrentProfile(p);
        })
    
        return () => {
            s.unsubscribe()
        }
      }, [])

    useEffect(() => {
        if (currentProfile) {
            data.getReceta(id).then((receta) => {
                decorator.decorate(receta).then((receta) => {
                    setReceta({...receta})
                })
                setReceta(decorator.decorateFechas(receta))
            })
        }
    }, [currentProfile, id, data])

    useEffect(() => {
        // si soy paciente, la receta es mía y no está dispensada,
        // entonces puedo enviar la receta a la farmacia
        if (!receta || !currentProfile) {
            setShowSendFarmacia(false)
            setShowConfirmarDispensa(false)
            setShowDispensar(false)
        } else {
            setShowSendFarmacia(permisos.canSendFarmacia(receta!, currentProfile!))
            setShowConfirmarDispensa(permisos.canConfirmarDispensa(receta!, currentProfile!))
            setShowDispensar(permisos.canDispensa(receta!, currentProfile!))
        }
    }, [receta, currentProfile])

    function showCertificado(modal: HTMLModalCertificado) {
        console.log(receta?.dispensa?.certificado)
        modal.open();
    }

    function showCertificadoMedico() {
        if (certificadoMedico === null) {
            buttonCertificadoMedico.current!.disabled = true
            DIDResolver(receta!.didMedico).then((doc) => {
                setCertificadoMedico(doc)
                modalMedico.current!.open();
                buttonCertificadoMedico.current!.disabled = false
            }).catch((e) => {
                setCertificadoMedico(null)
                buttonCertificadoMedico.current!.disabled = false
                console.error("Error al obtener el certificado", e) 
            })
        } else {
            modalMedico.current!.open();
        }
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
            setReceta( {...receta, ['enCarpetaFavoritos']: receta.enCarpetaFavoritos });
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
                        data.moveRecetaToFolder(receta, RECETA_FOLDER_INBOX, RECETA_FOLDER_PAPELERA);
                        data.moveRecetaToFolder(receta, RECETA_FOLDER_ARCHIVED, RECETA_FOLDER_PAPELERA);
                        data.moveRecetaToFolder(receta, RECETA_FOLDER_OUTBOX, RECETA_FOLDER_PAPELERA);
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

    const sendReceta = (receta: Receta) => {
        if (!currentProfile) {
            return;
        }
        recetaSender.current?.send(receta);
        //recetaService.sendReceta(currentProfile!, receta);
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Receta</IonTitle>
                    <IonButtons slot="end">
                        {receta?.certificado ?(
                        <IonButton onClick={() => showCertificado(modal.current!)} >
                            <IonIcon slot="start" icon={medalOutline} />
                            Ver certificado
                        </IonButton>
                        ) : ''}
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList className='receta-view-detail'>
                    <IonItem>
                        <IonLabel>
                            <h2>Paciente</h2>
                            <p>{receta?.nombrePaciente}</p>
                        </IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonLabel>
                            <h2>DID Paciente</h2>
                            <p>{receta?.didPaciente}</p>
                        </IonLabel>
                        <IonButtons slot='end'>
                            <IonButton size="small" onClick={() => {
                                    navigator.clipboard.writeText(receta!.didPaciente);
                                    // acá abro un toast
                                    presentToast({
                                        message: 'DID copiado al portapapeles.',
                                        duration: 1000,
                                        position: 'bottom'
                                    });
                            }}>
                                <IonIcon icon={copyOutline} size="small" slot="icon-only" />
                            </IonButton>
                        </IonButtons>
                    </IonItem>
                    <IonItem>
                        <IonLabel>
                            <h2>Fecha de emisión</h2>
                            <p>{receta?.fechaEmision?.toLocaleDateString()} {receta?.fechaEmision?.toLocaleTimeString()}</p>
                        </IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonLabel>
                            <h2>Fecha de vencimiento</h2>
                            <p>{receta?.fechaVencimiento?.toLocaleDateString()}</p>
                        </IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonLabel>
                            <h2>Medicamentos</h2>
                            <ul>
                                {receta?.medicamentos.map((medicamento, index) => (
                                    <li key={index}>{medicamento}</li>
                                ))}
                            </ul>
                        </IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonLabel>
                            <h2>Indicaciones</h2>
                            <p>{receta?.indicaciones}</p>
                        </IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonLabel>
                            <h2>Médico prescriptor</h2>
                            <p>{receta?.didMedico}</p>
                            <p>{receta?.nombreMedico}</p>
                        </IonLabel>
                        {receta?.didMedico ? (
                            <IonButtons slot='end'>
                                <IonButton size="small" onClick={() => {
                                    navigator.clipboard.writeText(receta?.didMedico);
                                    // acá abro un toast
                                    presentToast({
                                        message: 'DID copiado al portapapeles.',
                                        duration: 1000,
                                        position: 'bottom'
                                    });
                                }}>
                                    <IonIcon icon={copyOutline} size="small" slot="icon-only" />
                                </IonButton>
                                <IonButton ref={buttonCertificadoMedico} size="small" onClick={() => showCertificadoMedico()}>
                                    <IonIcon icon={medalOutline} size="small"  slot="icon-only" />
                                </IonButton>
                                <ModalCertificado ref={modalMedico} certificado={certificadoMedico} title={receta.nombreMedico}/>
                            </IonButtons>
                        ) : ''}
                    </IonItem>

                    {receta?.dispensa ? (
                    <IonItem>
                        <IonLabel>
                            <h2>Dispensa</h2>
                            <p>{receta.dispensa.fechaDispensa.toLocaleDateString() + " " + receta.dispensa.fechaDispensa.toLocaleTimeString()}</p>
                        </IonLabel>
                        <IonButtons slot="end">
                            <IonButton size="small" onClick={(e) => showCertificado(modalDispensa.current!)}>
                                <IonIcon icon={medalOutline} size="small" slot="icon-only" />
                            </IonButton>
                        </IonButtons>
                        <ModalCertificado ref={modalDispensa} certificado={receta.dispensa.certificado}  title="Dispensa" />
                    </IonItem>
                    ) : ''}

                    <IonItemDivider>
                    </IonItemDivider>

                    <IonItem>
                        <IonButtons slot="start">
                            {false === receta?.enCarpetaPapelera ? (
                            <IonButton slot="start" color="light" fill="clear" onClick={(e) => deleteReceta(receta)}>
                                <IonIcon slot="icon-only" icon={trashOutline} color="danger" />
                            </IonButton>
                            ) : ''}
                            {receta ? (
                            <IonButton slot="start" size="small" onClick={(e) => {toggleFavorite(receta!)}} color="primary">
                                <IonIcon slot="icon-only" icon={receta?.enCarpetaFavoritos ? heart : heartOutline} />
                            </IonButton>
                            ) : ''}
                        </IonButtons>
                        <IonButtons slot="end">
                            {showSendFarmacia ? (
                            <IonButton slot="end" size="small" color="primary" fill="solid" onClick={(e) => sendReceta(receta!)}>
                                <IonIcon slot="start" icon={send} />
                                Enviar a farmacia
                            </IonButton>
                            ) : ''}
                            {showConfirmarDispensa ? (
                                <IonButton size="small" color="success" fill="solid">
                                    <IonIcon slot="start" icon={checkmarkDone} />
                                    Confirmar dispensa
                                </IonButton>
                            ) : ''}
                            {showDispensar ? (
                                <IonButton size="small" color="primary" fill="solid" routerLink={'/dispensa/'+receta?.id}>
                                    <IonIcon slot="start" icon={bagAdd} />
                                    Dispensar
                                </IonButton>
                            ) : ''}
                        </IonButtons>
                    </IonItem>
                </IonList>

                <ModalCertificado ref={modal} certificado={receta?.certificado} />
                <RecetaSender ref={recetaSender}/>
                <IonText className='ion-padding' color="medium">Estado interno: {receta?.estado}</IonText>

            </IonContent>
        </IonPage>
    );
}

export default RecetaView;