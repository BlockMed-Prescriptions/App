import { VerifiableCredential } from "@quarkid/vc-core"

type Recepcion = {
    recetaId: string,
    fechaRecepcion: Date,
    certificado: VerifiableCredential
}

export default Recepcion;