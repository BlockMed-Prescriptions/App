
import Transaccion from "../model/Transaccion";
import RecetaDecorator from "../receta/RecetaDecorator";
import RecetaBcData from "../service/RecetaBcData";
import { MessageReceiver } from "./MessageReceiver";


const TransaccionReceiver = () => {
    console.log("Starting worker TransaccionReceiver")
    const observable = MessageReceiver()
    const recetaBcData = RecetaBcData.getInstance();

    const addTransaccion = async(transaccion: Transaccion):Promise<boolean> => {
        const  receta = await recetaBcData.getReceta(transaccion.recetaId)
        return recetaBcData.addTransaccionToReceta(receta, transaccion)
    }

    observable.subscribe((message) => {
        if ('transaccion' !== message.class) return;
        console.log("TransaccionReceiver", message)
        switch (message.type) {
            case 'informar-transaccion':
                const transaccion:Transaccion = {
                    recetaId: message.credential.id,
                    hashTransaccion: message.credential.credentialSubject["schema:identifier"],
                    tipo: message.credential.credentialSubject["schema:type"],
                    certificado: message.credential
                }
                addTransaccion(transaccion).then((added) => {
                    console.log("Transaccion añadida", added, transaccion)
                }).catch((e) => {
                    console.error("Error añadiendo transacción, reintento en 5 segundos", e)
                    setTimeout(() => {
                        addTransaccion(transaccion).then((added) => {
                            console.log("Transaccion añadida", added, transaccion)
                        }).catch((e) => {
                            console.error("Error añadiendo transacción", e)
                        })
                    }, 5000)
                })
                break
            default:
                console.error("Mensaje desconocido", message)
                throw new Error("Mensaje desconocido")
        }
    })
}

export default TransaccionReceiver
