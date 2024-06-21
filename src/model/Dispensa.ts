import { VerifiableCredential } from "@quarkid/vc-core";

type Dispensa = {
    didFarmacia: string
    recetaId: string;
    medicamentos: string[];
    lotes: string[];
    fechaDispensa: Date

    certificado?: VerifiableCredential
    confirmacionDispensa: Date|null
}

export default Dispensa;