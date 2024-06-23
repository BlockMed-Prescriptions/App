import { VerifiableCredential } from "@quarkid/vc-core";

type Dispensa = {
    // Datos inmutables
    didFarmacia: string
    recetaId: string;
    medicamentos: string[];
    lotes: string[];
    fechaDispensa: Date
    certificado?: VerifiableCredential

    // de trabajo
    confirmacionDispensa: Date|null
}

export default Dispensa;