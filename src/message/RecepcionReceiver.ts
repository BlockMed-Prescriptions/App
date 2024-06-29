import { MessageReceiver } from "./MessageReceiver";
import Dispensa from "../model/Dispensa";
import RecetaBcData from "../service/RecetaBcData";
import { RecetaEstado } from "../model/Receta";
import Recepcion from "../model/Recepcion";


const RecepcionReceiver = () => {
    console.log("Starting worker RecepcionReceiver")
    const data = RecetaBcData.getInstance();
    const observable = MessageReceiver()
    
    observable.subscribe((message) => {
        if ('recepcion' !== message.class) return;
        console.log("Recepcion", message)
        switch (message.type) {
            case 'confirmacion-dispensa':
                break
            default:
                throw new Error("Mensaje desconocido. Error ent ipo de mensaje")
        }

        const recepcion: Recepcion = {
            recetaId: message.credential.credentialSubject["schema:identifier"],
            fechaRecepcion: new Date(message.credential.credentialSubject["schema:Date"]),
            certificado: message.credential
        }

        data.getReceta(recepcion.recetaId).then((receta) => {
            console.log("Recepción", receta, recepcion)
            
            receta.recepcion = recepcion
            receta.estado = 'consumida'
            receta.consumida = true
            data.saveReceta(receta)
        })
    })

}

export default RecepcionReceiver;