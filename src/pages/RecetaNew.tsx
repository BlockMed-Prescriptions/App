import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonPage, IonTitle, IonToggle, IonToolbar, LocationHistory, useIonAlert, useIonLoading, useIonToast } from '@ionic/react';
import RecetaBcData, { RECETA_FOLDER_OUTBOX } from '../service/RecetaBcData';
import Profile from '../model/Profile';
import { DIDResolver } from '../quarkid/DIDResolver';
import { DIDDocument } from '@quarkid/did-core';
import { close, checkmark, cameraOutline } from 'ionicons/icons';
import RecetaService from '../receta/RecetaService';
import { RecetaGenerator } from '../receta/RecetaGenerator';
import Receta from '../model/Receta';
import ModalScanner, { HTMLModalScanner } from '../components/ModalScanner';
import ProfileHandler from '../service/ProfileHandler';
import PacienteProvider from '../receta/PacienteProvider';

const RecetaNew: React.FC = () => {

    const history = useHistory<LocationHistory>();
    const [presentToast, dismissToast] = useIonToast();
    const [presentAlert] = useIonAlert();

    const data = RecetaBcData.getInstance();
    const pacienteProvider = PacienteProvider.getInstance();

    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    let didDocument: DIDDocument | null = null;

    // Validación de DID Paciente
    const [isDIDTouched, setDIDIsTouched] = useState(false);
    const [isDIDValid, setDIDIsValid] = useState<boolean>(false);
    const [DIDErrorText, setDIDErrorText] = useState<string>('');
    const [DIDPaciente, setDIDPaciente] = useState<string>('');
    const modalScanner = useRef<HTMLModalScanner>(null);

    useEffect(() => {
        setCurrentProfile(data.getCurrentProfile());
        const s = data.observeProfile().subscribe((p) => {
            if (currentProfile?.didId !== p?.didId) {
                setCurrentProfile(p);
            }
        })

        return () => {
            s.unsubscribe();
        }
    }, [])

    // cada vez que entro a la página, reseteo los datos
    useEffect(() => {
        const listen = history.listen(() => {
            setDIDIsTouched(false);
            setDIDIsValid(false);
            setDIDErrorText('');
            setDIDPaciente('');

            setNombreIsTouched(false);
            setNombreIsValid(false);
            setNombreErrorText('');
            setNombrePaciente('');

            setPrescripcionIsTouched(false);
            setPrescripcionIsValid(false);
            setPrescripcionErrorText('');
            setPrescripcion('');

            setIndicacionIsTouched(false);
            setIndicacionIsValid(false);
            setIndicacionErrorText('');
            setIndicacion('');
        })

        return () => {
            console.log("Unsubscribed from history.")
            listen()
        }
    }, [history])

    const validateDid = (didId: string) => {
        setDIDPaciente(didId);
        if (!didId) {
            setDIDIsValid(false);
            setDIDErrorText('El DID no puede estar vacío.');
            return;
        }
        // didId debe tener la forma did:method:method-specific-id
        if (!didId.match(/^did:[a-z0-9]+:[a-zA-Z0-9\-\_]+$/)) {
            setDIDIsValid(false)
            setDIDErrorText('El DID debe tener la forma did:method:id.')
            return;
        }
        
        DIDResolver(didId).then((doc) => {
            console.log("DID Document", doc);
            didDocument = doc
            setDIDIsValid(true);
        }).catch((e) => {
            setDIDErrorText('El DID no pudo ser resuelto.');
            setDIDIsValid(false);
        })
    }

    useEffect(() => {
        validateDid(DIDPaciente);
    }, [DIDPaciente])

    useEffect(() => {
        console.log("DID Paciente", DIDPaciente, isDIDValid)
        if (isDIDValid) {
            console.log("buscando")
            pacienteProvider.getPaciente(DIDPaciente).then((paciente) => {
                console.log("Paciente", paciente)
                if (paciente && nombrePaciente === '') {
                    setNombrePaciente(paciente.nombre)
                }
            })
        }
    }, [isDIDValid])


    // Validación del nombre de paciente
    const [isNombreTouched, setNombreIsTouched] = useState(false);
    const [isNombreValid, setNombreIsValid] = useState<boolean>(false);
    const [nombreErrorText, setNombreErrorText] = useState<string>('');
    const [nombrePaciente, setNombrePaciente] = useState<string>('');

    useEffect(() => {
        validateNombrePaciente(nombrePaciente);
    }, [nombrePaciente])

    const validateNombrePaciente = (nombre: string) => {
        setNombrePaciente(nombre);
        if (!nombre) {
            setNombreIsValid(false);
            setNombreErrorText('El nombre no puede estar vacío.');
            return;
        }

        // debe tener sólo letras y espacios, teniendo en cuenta acentuaciones
        if (!nombre.match(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/)) {
            setNombreIsValid(false);
            setNombreErrorText('El nombre sólo puede tener letras y espacios.');
            return;
        }

        setNombreIsValid(true);
    }

    // Validación de la prescripción. No puede estar vacía
    const [isPrescripcionTouched, setPrescripcionIsTouched] = useState(false);
    const [isPrescripcionValid, setPrescripcionIsValid] = useState<boolean>(false);
    const [prescripcionErrorText, setPrescripcionErrorText] = useState<string>('');
    const [prescripcion, setPrescripcion] = useState<string>('');

    useEffect(() => {
        validatePrescripcion(prescripcion);
    }, [prescripcion])

    const validatePrescripcion = (prescripcion: string) => {
        setPrescripcion(prescripcion);
        if (!prescripcion) {
            setPrescripcionIsValid(false);
            setPrescripcionErrorText('La prescripción no puede estar vacía.');
            return;
        }

        setPrescripcionIsValid(true);
    }

    // Validación de la indicación. Es obligatoria
    const [isIndicacionTouched, setIndicacionIsTouched] = useState(false);
    const [isIndicacionValid, setIndicacionIsValid] = useState<boolean>(false);
    const [indicacionErrorText, setIndicacionErrorText] = useState<string>('');
    const [indicacion, setIndicacion] = useState<string>('');

    useEffect(() => {
        validateIndicacion(indicacion);
    }, [indicacion])

    const validateIndicacion = (indicacion: string) => {
        setIndicacion(indicacion);
        if (!indicacion) {
            setIndicacionIsValid(false);
            setIndicacionErrorText('El diagnóstico no puede estar vacío.');
            return;
        }

        setIndicacionIsValid(true);
    }

    const scanData = (data: string) => {
        let profileTarget = ProfileHandler.fromQrCode(data);
        if (profileTarget) {
            setNombrePaciente(profileTarget.name)
            setDIDPaciente(profileTarget.didId)
            validateDid(profileTarget.didId)
            validateNombrePaciente(profileTarget.name)
        }
        modalScanner.current?.dismiss();
    }

    // Confirmación.
    const confirm = () => {
        if (!isDIDValid || !isNombreValid || !isPrescripcionValid || !isIndicacionValid) {
            presentToast({
                message: 'Por favor, complete los campos correctamente.',
                duration: 2000,
                position: 'top',
                color: 'danger',
                buttons: [
                    {
                        text: 'Cerrar',
                        role: 'cancel'
                    }
                ]
                });
            return;
        }

        RecetaGenerator(
            currentProfile!, DIDPaciente, nombrePaciente, [prescripcion], indicacion,
            presentToast, dismissToast
        ).then((receta: Receta) => {
            console.log("TODO GENERADO!")
            presentToast({
                message: "Receta enviada al paciente.",
                position: "top",
                color: "success",
                duration: 2000,
                buttons: [
                    {
                        text: "Ok",
                        handler: () => {
                            dismissToast()
                        }
                    }
                ]
            })
        
            // me muevo a la carpeta de salida
            history.push('/folder/Outbox');
        }).catch((e) => {
            console.error(e)
            presentToast({
                message: 'Error al generar la receta. ' + e,
                duration: 2000,
                position: 'top',
                color: 'danger',
                buttons: [
                    {
                        text: 'Cerrar',
                        role: 'cancel'
                    }
                ]
            })
        })
    }
    

    // cancelación, voy a la página Outbox
    const cancel = () => {
        // si se tocó algo, entonces pregunto si está seguro
        if (isDIDTouched || isNombreTouched || isPrescripcionTouched || isIndicacionTouched) {
            presentAlert({
                header: 'Cancelar',
                message: '¿Está seguro de cancelar la creación de la receta?',
                buttons: [
                    {
                        text: 'Cancelar',
                        role: 'cancel'
                    },
                    {
                        text: 'Aceptar',
                        handler: () => {
                            history.push('/folder/Outbox');
                        }
                    }
                ]
            });
            return;
        } else {
            history.push('/folder/Outbox');
        }
    }


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Crear una receta</IonTitle>
                    <IonButtons slot="end">
                        <IonButton color="primary" onClick={() => confirm()}>Confirmar</IonButton>
                        <IonButton color="" onClick={() => cancel()}>Cancelar</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList>
                    <IonItem lines="inset">
                        <IonLabel position="stacked">DID Médico</IonLabel>
                        <p>{currentProfile?.didId}</p>
                    </IonItem>
                    <IonItem lines="none">
                        <IonInput
                            onIonChange={(event) => setDIDPaciente(event.detail.value!)}
                            onIonBlur={() => setDIDIsTouched(true)}
                            label="DID Paciente"
                            labelPlacement="stacked"
                            className={`${isDIDValid && 'ion-valid'} ${isDIDValid === false && 'ion-invalid'} ${isDIDTouched && 'ion-touched'}`}
                            errorText={DIDErrorText}
                            value={DIDPaciente}
                        ></IonInput>
                        {isDIDTouched ?(
                        <IonIcon icon={isDIDValid ? checkmark : close} color={isDIDValid ? "success" : "danger"} slot="end" />
                        ) : null}
                        <IonButtons slot="end">
                            <IonButton onClick={() => {modalScanner?.current?.open()}}>
                                <IonIcon icon={cameraOutline} slot="icon-only" />
                            </IonButton>
                        </IonButtons>
                        <ModalScanner ref={modalScanner} onScan={(data) => {scanData(data)}} />
                    </IonItem>

                    <IonItem>
                        <IonInput
                            onIonChange={(event) => setNombrePaciente(event.detail.value!)}
                            onIonBlur={() => setNombreIsTouched(true)}
                            label="Nombre Paciente"
                            labelPlacement="stacked"
                            className={`${isNombreValid && 'ion-valid'} ${isNombreValid === false && 'ion-invalid'} ${isNombreTouched && 'ion-touched'}`}
                            errorText={nombreErrorText}
                            value={nombrePaciente}
                        ></IonInput>
                        <IonIcon icon={isNombreValid ? checkmark : close} color={isNombreValid ? "success" : "danger"} slot="end" />
                    </IonItem>

                    <IonItem>
                        <IonInput
                            onIonChange={(event) => setPrescripcion(event.detail.value!)}
                            onIonBlur={() => setPrescripcionIsTouched(true)}
                            label="Prescripción"
                            labelPlacement="stacked"
                            className={`${isPrescripcionValid && 'ion-valid'} ${isPrescripcionValid === false && 'ion-invalid'} ${isPrescripcionTouched && 'ion-touched'}`}
                            errorText={prescripcionErrorText}
                            value={prescripcion}
                        ></IonInput>
                        <IonIcon icon={isPrescripcionValid ? checkmark : close} color={isPrescripcionValid ? "success" : "danger"} slot="end" />
                    </IonItem>

                    <IonItem>
                        <IonInput
                            onIonChange={(event) => setIndicacion(event.detail.value!)}
                            onIonBlur={() => setIndicacionIsTouched(true)}
                            label="Diagnóstico"
                            labelPlacement="stacked"
                            className={`${isIndicacionValid && 'ion-valid'} ${isIndicacionValid === false && 'ion-invalid'} ${isIndicacionTouched && 'ion-touched'}`}
                            errorText={indicacionErrorText}
                            value={indicacion}
                        ></IonInput>
                        <IonIcon icon={isIndicacionValid ? checkmark : close} color={isIndicacionValid ? "success" : "danger"} slot="end" />
                    </IonItem>
                </IonList>
            </IonContent>
        </IonPage>
    );

}

export default RecetaNew;
