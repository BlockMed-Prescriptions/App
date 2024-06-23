/**
 * Esta función se encarga de recibir recetas.
 * 
 * Se conecta al message receiver y, de recibir una receta, la guarda en el storage.
 * Maneja los mensajes de emisión de receta, envío a farmacia, solicitud de confirmación de dispensa y dispensa.
 */

import { MessageReceiver } from "./MessageReceiver";
import Receta from "../model/Receta";
import RecetaBcData, { RECETA_FOLDER_INBOX } from "../service/RecetaBcData";
import RecetaService from "../receta/RecetaService";

const recetaBcData = RecetaBcData.getInstance();
const observable = MessageReceiver()

const RecetaReceiver = () => {
    const recetaService = RecetaService.getInstance()

    observable.subscribe((message) => {
        if ('receta' !== message.class) return;
        const receta: Receta = recetaService.buildRecetaFromCredential(message.credential)
        switch (message.type) {
            case 'envio-farmacia':
                receta.estado = 'enviada-farmacia'
            case 'emision-receta':
                if (receta.estado === undefined) receta.estado = 'emitida'
                recetaBcData.saveReceta(receta)
                recetaBcData.addRecetaToFolder(receta, RECETA_FOLDER_INBOX)
                break;
            default:
                console.error("Mensaje desconocido", message)
                throw new Error("Mensaje desconocido")
        }
    })
}

export default RecetaReceiver;
