/**
 * Esta función se encarga de recibir recetas.
 *
 * Se conecta al message receiver y, de recibir una receta, la guarda en el storage.
 * Maneja los mensajes de emisión de receta, envío a farmacia, solicitud de confirmación de dispensa y dispensa.
 */

import { MessageReceiver } from "./MessageReceiver";
import Receta from "../model/Receta";
import RecetaBcData, {
  RECETA_FOLDER_ARCHIVED,
  RECETA_FOLDER_INBOX,
  RECETA_FOLDER_PAPELERA,
} from "../service/RecetaBcData";
import RecetaService from "../receta/RecetaService";

const RecetaReceiver = (callback?: () => void) => {
  const recetaService = RecetaService.getInstance();
  console.log("Starting worker RecetaReceiver");
  const recetaBcData = RecetaBcData.getInstance();
  const observable = MessageReceiver();

  const saveReceta = (receta: Receta) => {
    recetaBcData
      .getReceta(receta.id!)
      .then((oldReceta) => {
        // la receta ya la tengo, entonces no la guardo
        recetaBcData.removeRecetaFromFolder(oldReceta, RECETA_FOLDER_ARCHIVED);
        recetaBcData.removeRecetaFromFolder(oldReceta, RECETA_FOLDER_PAPELERA);
        recetaBcData.addRecetaToFolder(oldReceta, RECETA_FOLDER_INBOX);
      })
      .catch((e) => {
        recetaBcData.saveReceta(receta).then(() => {
          console.log("Receta guardada", receta);
          if (callback) callback();
          recetaBcData.addRecetaToFolder(receta, RECETA_FOLDER_INBOX);
        });
      });
  };

  observable.subscribe((message) => {
    if ("receta" !== message.class) return;
    const receta: Receta = recetaService.buildRecetaFromCredential(
      message.credential
    );
    switch (message.type) {
      case "envio-farmacia":
        receta.estado = "enviada-farmacia";
      case "emision-receta":
        if (receta.estado === undefined) receta.estado = "emitida";
        saveReceta(receta);
        break;
      default:
        console.error("Mensaje desconocido", message);
        throw new Error("Mensaje desconocido");
    }
  });
};

export default RecetaReceiver;
