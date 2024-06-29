import { VerifiableCredential } from "@quarkid/vc-core";

export type Transaccion = {
    recetaId: string,
    hashTransaccion: string,
    tipo: 'dispensa' | 'emision',
    certificado?: VerifiableCredential
}

export default Transaccion;