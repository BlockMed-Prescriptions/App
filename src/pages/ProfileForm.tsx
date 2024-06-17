import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonPage, IonTitle, IonToggle, IonToolbar, useIonAlert, useIonLoading } from '@ionic/react';
import ProfileService from '../service/ProfileService';
import RecetaBcData from '../service/RecetaBcData';

const ProfileForm: React.FC = () => {

    const [isMedico, setIsMedico] = useState(false);
    const [isPaciente, setIsPaciente] = useState<boolean>(true);
    const [isFarmacia, setIsFarmacia] = useState<boolean>(false);
    const [nombre, setNombre] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    // para validación
    const [isTouched, setIsTouched] = useState(false);
    const [isValid, setIsValid] = useState<boolean>(false);


    const isValidEmail = (email: string) : boolean => {
        if ('' === email.trim()) {
            return false;
        }
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }


    const validateEmail = (ev: Event) => {
        const value = (ev.target as HTMLInputElement).value;
        if (value === '') return;
        isValidEmail(value) ? setIsValid(true) : setIsValid(false);
    };
    
    const markTouched = () => {
        setIsTouched(true);
    };
    
    const history = useHistory();
    const perfilService = ProfileService.getInstance();
    const data = RecetaBcData.getInstance();

    const [presentLoading, dismissLoading] = useIonLoading();

    const [presentAlert] = useIonAlert();

    useEffect(() => {
        // inicializo los roles
        setIsMedico(false)
        setIsPaciente(true)
        setIsFarmacia(false)
        // inicializo los campos
        setNombre('');
        setEmail('');
        setIsValid(false)
    }, []);

    useEffect(() => {
        if (isFarmacia) {
            setIsMedico(false);
            setIsPaciente(false);
        }
    }, [isFarmacia])

    useEffect(() => {
        if (isMedico || isPaciente) {
            setIsFarmacia(false);
        }
    }, [isMedico, isPaciente])

    const cancel = () => {
        // vuelvo a la página anterior
        history.goBack();
    }
    
    const crear = () => {
        presentLoading({
            message: 'Creando perfil...',
            spinner: 'bubbles'
        });
        let roles = [];
        if (isMedico) {
            roles.push('med');
        }
        if (isPaciente) {
            roles.push('pac');
        }
        if (isFarmacia) {
            roles.push('far');
        }

        perfilService.createProfile(nombre, email, roles).then((profile) => {
            dismissLoading();
            data.addProfile(profile);
            data.setCurrentProfile(profile);
            history.push('/folder/Inbox');
        });
    }

    const confirm = () => {
        // chequeo que haya ingresado nombre y email
        if (nombre.trim() === '' || !isValidEmail(email)) {
            presentAlert({
                header: 'Datos incompletos',
                message: 'Debe ingresar nombre y email',
                buttons: ['OK']
            });
            return;
        }

        // pregunto si está seguro
        presentAlert({
            header: 'Confirmación de creación de perfil',
            message: '¿Está seguro de crear el perfil?',
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                { text: 'OK', handler: () => crear()}
            ]
        });
    }
    
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Crear un Perfil</IonTitle>
                    <IonButtons slot="end">
                        <IonButton color="primary" onClick={() => confirm()}>Confirmar</IonButton>
                        <IonButton color="" onClick={() => cancel()}>Cancelar</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList>
                    <IonItem>
                        <IonLabel position="stacked">Nombre</IonLabel>
                        <IonInput onIonChange={e => setNombre(e.detail.value ?? '')} required={true} value={nombre}></IonInput>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">Email</IonLabel>
                        <IonInput
                            className={`${isValid && 'ion-valid'} ${isValid === false && 'ion-invalid'} ${isTouched && 'ion-touched'}`}
                            type="email"
                            required={true} value={email}
                            errorText="Invalid email"
                            onIonInput={(event) => { validateEmail(event); setEmail(event.detail.value ?? '')}}
                            onIonBlur={() => markTouched()}
                        >
                        </IonInput>
                    </IonItem>
                    <IonItem>
                        <IonList>
                            <IonItem lines="none">
                                <IonToggle checked={isMedico} onIonChange={e => setIsMedico(e.detail.checked)}>Médico/a</IonToggle>
                            </IonItem>
                            <IonItem lines="none">
                                <IonToggle checked={isPaciente} onIonChange={e => setIsPaciente(e.detail.checked)}>Paciente</IonToggle>
                            </IonItem>
                            <IonItem lines="none">
                                <IonToggle checked={isFarmacia} onIonChange={e => setIsFarmacia(e.detail.checked)}>Farmacia</IonToggle>
                            </IonItem>
                        </IonList>
                    </IonItem>
                </IonList>
            </IonContent>
        </IonPage>
    );
}

export default ProfileForm;