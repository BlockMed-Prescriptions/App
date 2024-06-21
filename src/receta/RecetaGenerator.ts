


/**
 * Esta funcion se encarga de generar una receta y de realizar todos los pasos, esto es
 * 
 * - Crear la receta a partir de sus parámetros
 * - Generar el certificado de la receta
 * - Validar el certificado
 * - Enviar la receta al paciente
 */

import Profile from "../model/Profile";
import RecetaService from "./RecetaService";
import { CredentialSigner } from "../quarkid/CredentialSigner";
import { CredentialVerifier } from "../quarkid/CredentialVerifier";
import RecetaBcData, { RECETA_FOLDER_OUTBOX } from "../service/RecetaBcData";
import Receta from "../model/Receta";
import MesssageSender from "../message/MessageSender";

const recetaService:RecetaService = RecetaService.getInstance()
const data:RecetaBcData = RecetaBcData.getInstance()


export const RecetaGenerator = async (
    profile: Profile,
    didPaciente: string,
    nombrePaciente: string,
    medicamentos: string[],
    indicaciones: string,
    presentToast: (opts: any) => Promise<void>,
    dismissToast: () => Promise<void>
)
: Promise<Receta> => {
    let receta = recetaService.buildReceta(
        profile.didId!,
        didPaciente,
        nombrePaciente,
        medicamentos,
        indicaciones);

    console.log("Receta", receta)

    await presentToast({
        message: "Generando certificado ...",
        position: "top",
        color: "warning"
    })

    let certificado
    try {
        certificado = await recetaService.generateCertificate(receta, profile)
        console.log("Certificado", certificado)
        await dismissToast()
    } catch (e) {
        await dismissToast()
        throw e
    }
    
    await presentToast({
        message: "Firmando certificado ...",
        position: "top",
        color: "warning"
    })

    let vc
    try {
        vc = await CredentialSigner(certificado, profile)
        receta.certificado = vc
        dismissToast()
    } catch (e) {
        await dismissToast()
        throw e
    }

    await presentToast({
        message: "Certificado firmado, procedemos a verificar ...",
        position: "top",
        color: "warning",
    })

    let verifyResult
    try {
        verifyResult = await CredentialVerifier(receta.certificado, profile)
        await dismissToast()
    } catch (e) {
        await dismissToast()
        throw e
    }

    if (!verifyResult || !(verifyResult.result)) {
        console.error("Certificado firmado pero no verificado. Error: ", verifyResult)
        dismissToast()
        throw new Error("Certificado firmado pero no verificado. Error: " + verifyResult.error?.description)
    }

    // Guardo la receta en la persistencia local
    await data.saveReceta(receta, RECETA_FOLDER_OUTBOX)

    try {
        await presentToast({
            message: "Enviando receta al paciente ...",
            position: "top",
            color: "warning"
        })
        await MesssageSender(profile, receta.didPaciente, 'emision-receta', receta.certificado)
    } catch (e) {
        console.error("Error enviando la receta al paciente", e)
        await dismissToast()
        throw e
    }

    await dismissToast()

    return receta
}