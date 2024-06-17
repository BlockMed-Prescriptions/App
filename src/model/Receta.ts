
type Receta = {
    didMedico: string;
    didPaciente: string;
    nombrePaciente: string;

    medicamentos: string[];
    indicaciones: string;

    fechaEmision: Date;
    fechaVencimiento: Date;

    id?: string;
    certificado?: any

    // Otras propiedades de trabajo
    enCarpetaFavoritos?: boolean
}

export default Receta;