import { VerifiableCredentialService } from "@quarkid/vc-core";
import Profile from "../model/Profile";
import Transaccion from "../model/Transaccion";
import { CredentialSigner } from "../quarkid/CredentialSigner";
import RecetaBcData from "../service/RecetaBcData";

const vcService = new VerifiableCredentialService ()
const data = RecetaBcData.getInstance()

const generateCertificate = async (didProfile: string, transaccion: Transaccion) => {
    const fecha = new Date
    const credential = await vcService.createCredential({
        context: [
        "https://w3id.org/security/v2",
        "https://w3id.org/security/bbs/v1",
        ],
        vcInfo: {
            issuer: didProfile,
            issuanceDate: fecha,
            expirationDate: new Date(fecha.getFullYear() + 5,fecha.getMonth(), fecha.getDate()),
            id: transaccion.recetaId,
            types: ["TransaccionCertificate"],
        },
        data: {
            type: "Transaccion",
            // indicaciones: receta.indicaciones,
            "schema:identifier": transaccion.hashTransaccion,
            "schema:type": transaccion.tipo,
        },
        mappingRules: null,
    })

    return credential;
}

export const TransaccionGenerator = async (
    profile: Profile,
    recetaId: string,
    hashTransaccion: string,
    tipo: 'dispensa' | 'emision',
    onProgress? : (msg: string, type: 'success' | 'info' | 'error') => void,
) : Promise<Transaccion> => {

    let transaccion: Transaccion = {
        recetaId: recetaId,
        hashTransaccion: hashTransaccion,
        tipo: tipo
    }

    onProgress && onProgress("Firmando transacción ...", 'info')
    let vc = null
    try {
        const certificado = await generateCertificate(profile.didId!, transaccion)
        vc = await CredentialSigner(certificado, profile)
        transaccion.certificado = vc
    } catch (e) {
        throw e
    }

    return transaccion
}

export default TransaccionGenerator