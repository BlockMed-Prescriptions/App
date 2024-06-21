import { IDIDCommMessage } from "@quarkid/kms-core";
import { VerifiableCredential } from "@quarkid/vc-core";
import Profile from "../model/Profile";
import { buildKms } from "../service/KmsFactory";
import { ThreadMethod } from "@quarkid/dwn-client";
import DwnFactory, { DIDServiceUrl } from "../service/DwnFactory";
import { checkIfIsMessageType } from "../model/Message";

const sendMsg = async (emisor: string, target: string, packedMessage: any) => {
    const url = await DIDServiceUrl(target);
    const dwnClient = await DwnFactory(emisor);

    console.log("De ", emisor, " a ", target, " en ", url, " el mensaje ", packedMessage)

    dwnClient.sendMessage({
        targetDID: target, // DID del destinatario
        targetInboxURL: url, // refiere al servicio del dwn del destinatario, el mismo se obtiene resolviendo el DidDocument
        message: {
          data: packedMessage, //el mensaje a enviar debe ir empaquetado con DidComm
          descriptor: {
            method: ThreadMethod.Create,
            dateCreated: new Date(),
            dataFormat: "application/json",
          },
        },
    }).then((ret) => {
    }).catch((err) => {
        console.log("Error sending message: ", err);
        throw err;
    })

    return
}

const DIDMessageSend = async (profile: Profile,
        didTarget: string,
        messageId: string,
        messageBody: any,
        issuanceDate: Date,
    ) => {
    const kms = await buildKms(profile);
    
    let didEmisor = profile.didId;
    if (!didEmisor) {
        console.log("No DID found for profile.");
        throw new Error("No DID found for profile.");
    }

    let message:IDIDCommMessage = {
        type: "application/json",
        body: messageBody,
        from: didEmisor,
        to: [didTarget],
        id: messageId,
        created_time: issuanceDate.toISOString(),
    };

    // console.log("Verifiable Credential Signed", credential, message);
    const packedMessage = await kms.packDIDCommV2({
        senderVerificationMethodId:
            didEmisor + "#didComm", //Verification method del emisor del mensaje
        recipientVerificationMethodIds: [
            didTarget + "#didComm"
        ], //Verification method del destinatario del mensaje, puede haber mas de un destinatario
        message: message, //Mensage de tipo DIDComm
        packing: "authcrypt",
    });

    sendMsg(didEmisor, didTarget, packedMessage);
}

export default DIDMessageSend;