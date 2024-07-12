import Dispensa from "./Dispensa";
import Recepcion from "./Recepcion";
import Transaccion from "./Transaccion";

export type RecetaEstado = 'emitida' | 'vencida' | 'consumida' | 'pendiente-confirmacion-dispensa' | 'enviada-farmacia';

/**
 * 'emitida' => 'enviada-farmacia'
 * 'enviada-farmacia' => 'pendiente-confirmacion-dispensa'
 * 'pendiente-confirmacion-dispensa' => 'consumida'
 * 'emitida' | 'enviada-farmacia' | 'pendiente-confirmacion-dispensa'' => 'vencida'
 */
type Receta = {
    // Campos inmutables
    didMedico: string;
    didPaciente: string;
    nombrePaciente: string;

    medicamentos: string[];
    indicaciones: string;

    fechaEmision: Date;
    fechaVencimiento: Date;
    
    didFinanciador: string|null
    credencial: string|null

    id?: string;
    certificado?: any

    // Modificaciones a lo largo del ciclo de vida
    dispensa?: Dispensa
    recepcion?: Recepcion
    transacciones: Transaccion[]
    transactionHashDispensa?: string
    transactionHashEmision?: string

    // Otras propiedades de trabajo
    enCarpetaFavoritos?: boolean
    enCarpetaPapelera?: boolean
    enCarpetaArchivados?: boolean
    estado?: RecetaEstado
    nombreMedico?: string
    consumida?: boolean
    estadoBc?: 'emitida' | 'dispensada'
}

export default Receta;