import { ToastOptions, useIonToast } from "@ionic/react";
import { useEffect } from "react";
import { useHistory } from "react-router";
import RecetaBcData from "../service/RecetaBcData";
import ProfileHandler from "../service/ProfileHandler";

const RecetaSuscriberElement: React.FC = () => {
    const [presentToast, dismissToast] = useIonToast();
    const history = useHistory();
    const data = RecetaBcData.getInstance();

    useEffect(() => {
        const suscriptor = data.observeRecetas().subscribe((receta) => {
            const profile = data.getCurrentProfile();
            if (!profile) {
                return;
            }
            let toastObj: ToastOptions = {
                color: "success",
                cssClass: "toast",
                duration: 2000,
            };

            // ES PACIENTE ?
            if (receta.didPaciente === data.currentProfile?.didId) {
                // PACIENTE CONFIRMA DISPENSA
                if (
                    receta.estado === "pendiente-confirmacion-dispensa"
                ) {
                    // console.log("Receta no es para mi, por ahora, no hacemos nada.", receta.didPaciente, profile.didId)
                    toastObj.message = "¡Debes confirmar la recepción de medicamentos!";
                    toastObj.buttons = [
                        {
                            text: "Ver",
                            handler: () => {
                                dismissToast();
                                history.push(`/receipt?id=${receta.id}`);
                            },
                        },
                        {
                            text: "Inbox",
                            handler: () => {
                                dismissToast();
                                history.push("/receipts?type=sent");
                            },
                        },
                    ];
                }

                // PACIENTE RECIBE RECETA
                if (
                    receta.didPaciente === profile.didId &&
                    receta.estado === "emitida"
                ) {
                    //console.log("Receta no es para mi, por ahora, no hacemos nada.", receta.didPaciente, profile.didId)
                    toastObj.message = "¡Receta recibida!";
                    toastObj.buttons = [
                        {
                            text: "Ver",
                            handler: () => {
                                dismissToast();
                                history.push(`/receipt?id=${receta.id}`);
                            },
                        },
                        {
                            text: "Inbox",
                            handler: () => {
                                dismissToast();
                                history.push("/receipts?type=my");
                            },
                        },
                    ];
                }
            }

            // ES FARMACIA ?
            if (
                ProfileHandler.isFarmacia(profile) &&
                receta.estado === "enviada-farmacia"
            ) {
                // FARMACIA RECIBE RECETA
                toastObj.message = "¡Receta recibida de " + receta.nombrePaciente + "!";
                toastObj.buttons = [
                    {
                        text: "Inbox",
                        handler: () => {
                            dismissToast();
                            history.push("/receipts?type=pending");
                        },
                    },
                ];
            }
            if (!!toastObj.message) {
                presentToast(toastObj);
            }
        });

        return () => {
            suscriptor.unsubscribe();
        };
    }, [data]);

    return <></>;
};

export default RecetaSuscriberElement;
