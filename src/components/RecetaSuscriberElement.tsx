import { useIonToast } from "@ionic/react";
import { useEffect } from "react";
import { useHistory } from "react-router";
import RecetaBcData from "../service/RecetaBcData";
import ProfileHandler from "../service/ProfileHandler";
import Receta from "../model/Receta";
import Profile from "../model/Profile";


const RecetaSuscriberElement: React.FC = () => { 
    const [presentToast, dismissToast] = useIonToast()
    const history = useHistory();
    const data = RecetaBcData.getInstance();

    /**
     * Control de farmacia.
     */
    const casoEnviadaFarmacia = (receta: Receta, profile: Profile) : boolean => {
        if (ProfileHandler.isFarmacia(profile) && 'enviada-farmacia' === receta.estado) {
            presentToast({
                message: '¡Receta recibida de ' + receta.nombrePaciente + '!',
                color: 'success',
                duration: 2000,
                buttons: [
                    {
                        text: 'Inbox',
                        handler: () => {
                            dismissToast();
                            history.push('/folder/Inbox');
                        }
                    }
                ]
            })
            return true;
        }

        return true;
    }

    const casoDeboConfirmarDispensa = (receta: Receta, profile: Profile) : boolean => {
        if (receta.didPaciente !== profile.didId) {
            console.log("Receta no es para mi, por ahora, no hacemos nada.", receta.didPaciente, profile.didId)
            return false;
        }

        if (receta.estado !== 'pendiente-confirmacion-dispensa') {
            console.log("Receta no está pendiente de confirmación de dispensa, por ahora, no hacemos nada.", receta.estado)
            return false;
        }

        presentToast({
            message: '¡Debes confirmar la receta!',
            color: 'success',
            buttons: [
                {
                    text: 'Ver',
                    handler: () => {
                        dismissToast();
                        history.push('/receta/' + receta.id);
                    }
                }, {
                    text: 'Inbox',
                    handler: () => {
                        dismissToast();
                        history.push('/folder/Inbox');
                    }
                }
            ]
        })

        return true
    }

    /**
     * Paciente recibe del médico una nueva receta
     */
    const casoPacienteRecibeReceta = (receta: Receta, profile: Profile) : boolean => {
        if (receta.didPaciente !== profile.didId) {
            console.log("Receta no es para mi, por ahora, no hacemos nada.", receta.didPaciente, profile.didId)
            return false;
        }
        if (receta.estado !== 'emitida') {
            console.log("Receta no está activa, por ahora, no hacemos nada.", receta.estado)
            return false;
        }
        presentToast({
            message: '¡Receta recibida!',
            color: 'success',
            duration: 2000,
            buttons: [
                {
                    text: 'Ver',
                    handler: () => {
                        dismissToast();
                        history.push('/receta/' + receta.id);
                    }
                }, {
                    text: 'Inbox',
                    handler: () => {
                        dismissToast();
                        history.push('/folder/Inbox');
                    }
                }
            ]
        })

        return true;
    }

    useEffect(() => {
        const suscriptor = data.observeRecetas().subscribe((receta) => {
            const profile = data.getCurrentProfile();
            console.log("Receta actualizada", receta, profile)
            if (!profile) {
                return;
            }

            if (casoEnviadaFarmacia(receta, profile)) {
                return;
            } else if (casoPacienteRecibeReceta(receta, profile)) {
                return;
            } else if (casoDeboConfirmarDispensa(receta, profile)) {
                return;
            }

        })

        return () => {
            suscriptor.unsubscribe();
        }
    }, [data]);

    return (<></>)
}

export default RecetaSuscriberElement;