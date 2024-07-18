import { VerifiableCredentialService } from "@quarkid/vc-core";
import Profile from "../model/Profile";
import Recepcion from "../model/Recepcion";
import Receta from "../model/Receta";
import { CredentialSigner } from "../quarkid/CredentialSigner";
import MessageSender from "../message/MessageSender";
import RecetaBcData from "../service/RecetaBcData";
import BlockchainPublisher from "./BlockchainPublisher";
import TransaccionGenerator from "./TransaccionGenerator";

const vcService = new VerifiableCredentialService
const data = RecetaBcData.getInstance()
const publisher = BlockchainPublisher.getInstance()

export const RecepcionGenerator = async (
    profile: Profile,
    receta: Receta,
    onProgress? : (msg: string, type: 'success' | 'info' | 'error') => void,
) : Promise<Recepcion> => {

    const fechaRecepcion = new Date

    onProgress && onProgress("Generando certificado de recepción", 'success')
    const credential = await vcService.createCredential({
        context: [
        "https://w3id.org/security/v2",
        "https://w3id.org/security/bbs/v1",
        ],
        vcInfo: {
            issuer: profile.didId!,
            issuanceDate: fechaRecepcion,
            expirationDate: new Date(fechaRecepcion.getFullYear() + 5, fechaRecepcion.getMonth(), fechaRecepcion.getDate()),
            id: receta.id!,
            types: ["RecepcionCertificate"],
        },
        data: {
            type: "Recepcion",
            "schema:Date": fechaRecepcion.toISOString(),
            "schema:identifier": receta.id!,
        },
        mappingRules: null,
    })

    const recepcion:Recepcion = {
        recetaId: receta.id!,
        fechaRecepcion,
        certificado: credential
    }

    let vc
    try {
        onProgress && onProgress("Firmando certificado de recepción.", 'info')
        vc = await CredentialSigner(credential, profile)
    } catch (e) {
        onProgress && onProgress("Error firmando certificado de recepción", 'error')
        throw e
    }

    onProgress && onProgress("Enviando confirmación de recepción.", 'info')
    await MessageSender(profile, receta.dispensa!.didFarmacia, 'confirmacion-dispensa', recepcion.certificado)
    receta.recepcion = recepcion
    receta.estado = 'consumida'
    receta.consumida = true
    await data.saveReceta(receta)

    onProgress && onProgress("Registrando recepción en blockchain.", 'info')
    let hashTransaccion: string
    try {
        hashTransaccion = await publisher.dispensar(receta)
    } catch (e) {
        onProgress && onProgress("Error registrando recepción en blockchain.", 'error')
        throw e
    }

    try {
        const transaccion = await TransaccionGenerator(profile, receta.id!, hashTransaccion, 'dispensa', onProgress)
        await data.addTransaccionToReceta(receta, transaccion)
        await MessageSender(profile, receta.dispensa!.didFarmacia, 'informar-transaccion', transaccion.certificado!)
    } catch(e) {
        onProgress && onProgress("Error firmando transacción de recepción.", 'error')
        throw e
    }
    
    onProgress && onProgress("Recepción enviada.", 'success')
    return recepcion
}

export default RecepcionGenerator;