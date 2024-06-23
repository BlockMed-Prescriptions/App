import Dispensa from "./Dispensa";
import Recepcion from "./Recepcion";

export type RecetaEstado = 'emitida' | 'vencida' | 'consumida' | 'pendiente-confirmacion-dispensa' | 'enviada-farmacia';

/**
 * 'emitida' => 'enviada-farmacia'
 * 'enviada-farmacia' => 'pendiente-confirmacion-dispensa'
 * 'pendiente-confirmacion-dispensa' => 'consumida'
 * 'emitida' | 'enviada-farmacia' | 'pendiente-confirmacion-dispensa'' => 'vencida'
 */
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

    dispensa?: Dispensa
    recepcion?: Recepcion

    // Otras propiedades de trabajo
    enCarpetaFavoritos?: boolean
    enCarpetaPapelera?: boolean
    enCarpetaArchivados?: boolean
    estado?: RecetaEstado
    nombreMedico?: string
    consumida?: boolean
}

export default Receta;