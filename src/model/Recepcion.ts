import { VerifiableCredential } from "@quarkid/vc-core"

type Recepcion = {
    // todos estos datos son inmutables
    recetaId: string,
    fechaRecepcion: Date,
    certificado: VerifiableCredential
}

export default Recepcion;