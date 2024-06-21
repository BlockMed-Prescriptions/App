import { IonButton, IonButtons, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonMenuButton, IonModal, IonNote, IonPage, IonRow, IonTitle, IonToolbar, useIonAlert, useIonToast } from '@ionic/react';
import { useParams } from 'react-router';
import RecetaBcData from '../service/RecetaBcData';
import Profile from '../model/Profile';
import { useEffect, useRef, useState } from 'react';
import Receta from '../model/Receta';
import { copyOutline, medalOutline } from 'ionicons/icons';
import ModalCertificado, { HTMLModalCertificado } from '../components/ModalCertificado';
import { DIDResolver } from '../quarkid/DIDResolver';
import RecetaDecorator from '../receta/RecetaDecorator';

import './RecetaView.css';


const RecetaView: React.FC = () => {
    const { id } = useParams<{ id: string; }>();
    const data = RecetaBcData.getInstance();
    const decorator = new RecetaDecorator();
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [receta, setReceta] = useState<Receta | null>(null);
    const [presentToast] = useIonToast();

    const modal = useRef<HTMLModalCertificado>(null);
    const modalMedico = useRef<HTMLModalCertificado>(null);
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
                console.log("Receta", receta)
                setReceta(receta)
            })
        }
    }, [currentProfile, id, data])

    function showCertificado() {
        modal.current?.open();
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
                        <IonButton onClick={() => showCertificado()} >
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
                            <p>{receta ? decorator.getNombreMedico(receta) : ''}</p>
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
                                <ModalCertificado ref={modalMedico} certificado={certificadoMedico} />
                            </IonButtons>
                        ) : ''}
                    </IonItem>
                </IonList>

                <ModalCertificado ref={modal} certificado={receta?.certificado} />
            </IonContent>
        </IonPage>
    );
}

export default RecetaView;