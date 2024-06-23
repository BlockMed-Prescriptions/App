
import { MessageReceiver } from "./MessageReceiver";
import Dispensa from "../model/Dispensa";
import RecetaBcData from "../service/RecetaBcData";
import { RecetaEstado } from "../model/Receta";

const data = RecetaBcData.getInstance();
const observable = MessageReceiver()

const DispensaReceiver = () => {
    observable.subscribe((message) => {
        console.log("DispensaReceiver", message)
        if ('dispensa' !== message.class) return;
        let estado:RecetaEstado
        switch (message.type) {
            case 'solicitud-confirmacion-dispensa':
                estado = 'pendiente-confirmacion-dispensa'
                break
            default:
                throw new Error("Mensaje desconocido. Error ent ipo de mensaje")
        }

        const dispensa: Dispensa = {
            recetaId: message.credential.id,
            didFarmacia: message.credential.issuer as string,
            fechaDispensa: new Date(message.credential.issuanceDate),
            medicamentos: [message.credential.credentialSubject["schema:Drug"]["schema:name"]],
            lotes: [message.credential.credentialSubject["schema:DrugBatch"]["schema:batchNumber"]],
            confirmacionDispensa: null,
            certificado: message.credential
        }

        if (message.credential.credentialSubject["schema:Date"]) {
            dispensa.confirmacionDispensa = new Date(message.credential.credentialSubject["schema:Date"])
        }

        data.getReceta(dispensa.recetaId).then((receta) => {
            console.log("DispensaReceiver", receta, dispensa)
            
            receta.estado = estado
            receta.dispensa = dispensa
            data.saveReceta(receta)
        })
    })
}

export default DispensaReceiver;
