import Receta from "../model/Receta";
import FinanciadorProvider from "../service/FinanciadorProvider";
import RecetaBcData from "../service/RecetaBcData";

export type Paciente = {
    did: string;
    nombre: string;
    lastReceta?: Date
    cantidadRecetas: number,
    financiador: string|null,
    financiadorNombre?: string,
    credencial: string|null,
    recetas: string[]
}

class PacienteProvider {
    static instance: PacienteProvider;
    static getInstance(): PacienteProvider {
        if (!PacienteProvider.instance) {
            PacienteProvider.instance = new PacienteProvider(RecetaBcData.getInstance(), FinanciadorProvider.getInstance());
        }
        return PacienteProvider.instance;
    }

    private readonly data: RecetaBcData;
    private readonly financiadorProvider: FinanciadorProvider;
    private readed: boolean = false;

    // pacientes es un hash de pacientes por DID, que es un string
    private pacientes: { [did: string]: Paciente } = {}


    private constructor(data: RecetaBcData, financiadorProvider: FinanciadorProvider) {
        this.data = data
        this.financiadorProvider = financiadorProvider

        this.read().then(() => {
            this.data.observeRecetas().subscribe((receta) => {
                if (this.readed) {
                    this.add(receta)
                }
            })

            this.data.observeProfile().subscribe((profile) => {
                console.log("PacienteProvider: Profile changed", profile)
                this.readed = false
            })
        })
    }

    async getPacientes(): Promise<Paciente[]> {
        if (!this.readed) {
            await this.read()
        }
        return Object.entries(this.pacientes).map(([_, paciente]) => paciente)
    }

    async getPaciente(did: string): Promise<Paciente|undefined> {
        if (!this.readed) {
            await this.read()
        }
        return this.pacientes[did]
    }

    private add(receta: Receta) {
        let paciente: Paciente|undefined = this.pacientes[receta.didPaciente]
        if (paciente) {
            if (receta.fechaEmision > paciente.lastReceta!) {
                paciente.lastReceta = receta.fechaEmision
                paciente.nombre = receta.nombrePaciente
                paciente.financiador = receta.didFinanciador
                if (receta.didFinanciador) {
                    this.financiadorProvider.getFinanciador(receta.didFinanciador).then((financiador) => {
                        if (financiador) {
                            paciente.financiadorNombre = financiador.nombre
                        }
                    })
                }
                paciente.credencial = receta.credencial
            }
            if (paciente.recetas.indexOf(receta.id!) === -1) {
                paciente.recetas.push(receta.id!)
                paciente.cantidadRecetas++
            }
        } else {
            this.pacientes[receta.didPaciente] = {
                "did": receta.didPaciente,
                "nombre": receta.nombrePaciente,
                "lastReceta": receta.fechaEmision,
                "cantidadRecetas": 1,
                "recetas": [receta.id!],
                "financiador": receta.didFinanciador,
                "credencial": receta.credencial
            }
        }
    }

    private async read() {
        this.pacientes = {}
        const recetas = await this.data.getAllRecetas()
        this.readed = true
        recetas.forEach((receta) => {
            this.add(receta)
        })
    }
}

export default PacienteProvider;
