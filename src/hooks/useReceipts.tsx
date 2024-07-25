import React, { useRef } from "react";
import RecetaSender, { HTMLRecetaSender } from "../components/RecetaSender";
import Receta from "../model/Receta";
import Profile from "../model/Profile";
import { useIonAlert, useIonToast } from "@ionic/react";
import RecepcionGenerator from "../receta/RecepcionGenerator";

interface useReceiptsPropTypes { }
interface useReceiptsReturnTypes {
    sendReceta: (receta: Receta) => void,
    confirmReceta: (receta: Receta) => void,
    Component: JSX.Element
}

const useReceipts = (
    currentProfile: Profile | null,
    callback: () => void
): useReceiptsReturnTypes => {
    const [presentAlert] = useIonAlert()
    const [presentToast, dismissToast] = useIonToast();
    const recetaSender = useRef<HTMLRecetaSender>(null);
    const sendReceta = (receta: Receta) => {
        if (!currentProfile) {
            return;
        }
        recetaSender.current?.send(receta);
        // recetaService.sendReceta(currentProfile!, receta);
    };

    const confirmReceta = (receta: Receta) => {
        if (!currentProfile) {
            return;
        }
        if (!receta.dispensa) {
            return;
        }
        presentAlert({
            message: "¿Está seguro de que quiere confirmar la recepción de la medicación?",
            header: "Confirmar Recepción",
            buttons: [{
                text: 'Cancelar',
                role: 'cancel',
            },
            {
                text: "Confirmar",
                role: 'confirm',
                handler: async () => {
                    try {
                        await RecepcionGenerator(currentProfile!, receta, (msg, type) => {
                            dismissToast().then(() => {
                                let color = (type === 'info' ? 'primary' : type);
                                presentToast({
                                    message: msg,
                                    duration: 1000,
                                    cssClass: "toast",
                                    position: 'top',
                                    color: color
                                });
                                callback()
                            })
                        })
                        return true
                    } catch (e) {
                        return true
                    }
                }
            }
            ]
        })
    };

    return {
        sendReceta,
        confirmReceta,
        Component: <RecetaSender ref={recetaSender} callback={() => callback()} />,
    };
};

export default useReceipts;
