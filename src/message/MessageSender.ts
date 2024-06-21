import { VerifiableCredential } from "@quarkid/vc-core";
import Message, { checkIfIsMessageType, MessageType } from "../model/Message";
import Profile from "../model/Profile";
import DIDMessageSend from "../quarkid/DidMessageSender";



const MesssageSender = async (profile: Profile,
    didTarget: string,
    messageType: MessageType,
    credencial: VerifiableCredential
) => {
    const message = {
        type: messageType,
        credential: credencial,
        class: credencial.credentialSubject.type.toLowerCase()
    }

    if (!checkIfIsMessageType(message)) {
        console.log("El mensaje no es del tipo esperado")
        throw new Error("El mensaje no es del tipo esperado")
    }

    await DIDMessageSend(profile, didTarget, credencial.id, message,
        'string' === typeof credencial.issuanceDate ? new Date(credencial.issuanceDate) : credencial.issuanceDate)
}

export default MesssageSender