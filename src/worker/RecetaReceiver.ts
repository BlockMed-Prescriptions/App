
/**
 * Esta función se encarga de recibir recetas.
 * 
 * Se conecta al message receiver y, de recibir una receta, la guarda en el storage.
 */

import { MessageReceiver } from "./MessageReceiver";
import Receta from "../model/Receta";
import RecetaBcData, { RECETA_FOLDER_INBOX } from "../service/RecetaBcData";
import RecetaService from "../service/RecetaService";

const recetaBcData = RecetaBcData.getInstance();
const observable = MessageReceiver()

const RecetaReceiver = () => {
    const recetaService = RecetaService.getInstance()

    observable.subscribe((credential) => {
        console.log(credential)
        if (credential.credentialSubject && credential.credentialSubject.type === 'Receta') {
            const receta: Receta = recetaService.buildRecetaFromCredential(credential)
            recetaBcData.saveReceta(receta)
            recetaBcData.addRecetaToFolder(receta, RECETA_FOLDER_INBOX)
        }
    })
}

export default RecetaReceiver;
