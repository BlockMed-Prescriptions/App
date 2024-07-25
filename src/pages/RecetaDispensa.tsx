import { useHistory, useParams } from "react-router";
import RecetaBcData from "../service/RecetaBcData";
import { useEffect, useState } from "react";
import Profile from "../model/Profile";
import Receta from "../model/Receta";
import RecetaPermisos from "../receta/RecetaPermisos";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonMenuButton, IonInput, IonItemDivider, useIonToast } from "@ionic/react";
import { checkmark, close, arrowBack, bagAdd } from "ionicons/icons";
import { DispensaGenerator } from "../receta/DispensaGenerator";


const RecetaDispensa: React.FC = () => {
    const { id } = useParams<{ id: string; }>();
    const data = RecetaBcData.getInstance();
    const permisos = RecetaPermisos.getInstance();
    const history = useHistory();
    const [presentToast, dismissToast] = useIonToast();

    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [receta, setReceta] = useState<Receta | null>(null);

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
                /* decorator.decorate(receta).then(() => {
                    setReceta({...receta})
                })*/
                setReceta(receta)
            })
        }
    }, [currentProfile, id, data])

    // Validación del medicamento
    const [isMedicamentoTouched, setMedicamentoIsTouched] = useState(false);
    const [isMedicamentoValid, setMedicamentoIsValid] = useState<boolean>(false);
    const [medicamentoErrorText, setMedicamentoErrorText] = useState<string>('');
    const [medicamento, setMedicamento] = useState<string>('');

    const medicamentoChangeHandler = (event: CustomEvent) => {
        setMedicamentoIsTouched(true);
        validateMedicamento(event.detail.value);
    }

    const validateMedicamento = (medicamento: string) => {
        setMedicamento(medicamento);
        if (!medicamento) {
            setMedicamentoIsValid(false);
            setMedicamentoErrorText('El medicamento no puede estar vacío.');
            return;
        }

        setMedicamentoIsValid(true);
    }

    // Validación del lote
    const [isLoteTouched, setLoteIsTouched] = useState(false);
    const [isLoteValid, setLoteIsValid] = useState<boolean>(false);
    const [loteErrorText, setLoteErrorText] = useState<string>('');
    const [lote, setLote] = useState<string>('');

    const loteChangeHandler = (event: CustomEvent) => {
        setLoteIsTouched(true);
        validateLote(event.detail.value);
    }

    const validateLote = (lote: string) => {
        setLote(lote);
        if (!lote) {
            setLoteIsValid(false);
            setLoteErrorText('El lote no puede estar vacío.');
            return;
        }

        setLoteIsValid(true);
    }

    // accion de dispensar
    const dispensar = () => {
        if (isMedicamentoValid && isLoteValid) {
            DispensaGenerator(currentProfile!, receta!, [medicamento], [lote], presentToast, dismissToast).then(dispensa => {
                history.push('/folder/Inbox')
            })
        }
    }

    if (!currentProfile || receta === null || !permisos.canDispensa(receta, currentProfile)) {
        return <></>;
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
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList className=''>
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
                        <IonInput
                            onIonChange={medicamentoChangeHandler}
                            label="Medicamento"
                            labelPlacement="stacked"
                            className={`${isMedicamentoValid && 'ion-valid'} ${isMedicamentoValid === false && 'ion-invalid'} ${isMedicamentoTouched && 'ion-touched'}`}
                            errorText={medicamentoErrorText}
                            value={medicamento}
                        ></IonInput>
                        <IonIcon icon={isMedicamentoValid ? checkmark : close} color={isMedicamentoValid ? "success" : "danger"} slot="end" />
                    </IonItem>

                    <IonItem>
                        <IonInput
                            onIonChange={loteChangeHandler}
                            label="Lote"
                            labelPlacement="stacked"
                            className={`${isLoteValid && 'ion-valid'} ${isLoteValid === false && 'ion-invalid'} ${isLoteTouched && 'ion-touched'}`}
                            errorText={loteErrorText}
                            value={lote}
                        ></IonInput>
                        <IonIcon icon={isLoteValid ? checkmark : close} color={isLoteValid ? "success" : "danger"} slot="end" />
                    </IonItem>

                    <IonItemDivider>
                    </IonItemDivider>

                    <IonItem>
                        <IonButtons slot="start">
                            <IonButton onClick={(e) => history.goBack()}>
                                Volver
                                <IonIcon icon={arrowBack} slot="start" />
                            </IonButton>
                        </IonButtons>
                        <IonButtons slot="end">
                            <IonButton
                                expand="block"
                                onClick={() => {
                                    if (isMedicamentoValid && isLoteValid) {
                                        dispensar();
                                    }
                                }}
                            >
                                Dispensar
                                <IonIcon slot="start" icon={bagAdd} />
                            </IonButton>
                        </IonButtons>
                    </IonItem>

                </IonList>
            </IonContent>
        </IonPage>
    )
}

export default RecetaDispensa;
