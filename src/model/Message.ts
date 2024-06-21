import { VerifiableCredential } from "@quarkid/vc-core";

export type MessageType = 'emision-receta' | 'envio-farmacia' | 'solicitud-confirmacion-dispensa' | 'dispensa';

type Message = {
    type: MessageType,
    credential: VerifiableCredential,
    class: 'receta' | 'dispensa'
}

export const checkIfIsMessageType = (message: any) : boolean => {
    // chequeo que todos los campos de message estén en el tipo Message
    if (message.type && message.credential && message.class) {
        // tipo sólo puede ser los tipos especificados
        if (["emision-receta", "envio-farmacia", "solicitud-confirmacion-dispensa", "dispensa"].includes(message.type)) {
            // class sólo puede ser los tipos especificados
            if (["receta", 'dispensa'].includes(message.class)) {
                return true
            }
        }
    }

    return false
}


export default Message;
