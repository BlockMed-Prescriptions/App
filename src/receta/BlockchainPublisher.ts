import Receta from "../model/Receta";
import { config } from "../quarkid/config";

/*
# curl localhost:3000/api/v1.0/receta/emitir -H "Content-Type: application/json" \
#     -d '{"medicamentos": [{"codigo":  "Medicamento", "cantidad": 4}], "hash": "'$RECETA'"}'

curl localhost:3000/api/v1.0/receta/${RECETA}

# curl localhost:3000/api/v1.0/receta/dispensar -H "Content-Type: application/json" \
#     -d '{"didFarmacia": "did.recetasbc.farmacia", "hash": "'$RECETA'"}'
*/

type Medicamento = {
    codigo: string,
    cantidad: number
}

type RecetaResponse = {
    hash: string,
    estado: 'emitida' | 'dispensada',
    farmacia: string,
    medicamentos: Medicamento[]
}

class BlockchainPublisher {
    public static instance: BlockchainPublisher;
    private endpoint: string;

    public static getInstance(): BlockchainPublisher {
        const endpoint = config.recetasbcEndpoint
        if (!BlockchainPublisher.instance) {
            BlockchainPublisher.instance = new BlockchainPublisher(endpoint);
        }

        return BlockchainPublisher.instance;
    }

    private constructor(endpoint : string) {
        this.endpoint = endpoint;
    }

    public async emitir(receta: Receta) : Promise<string> {
        const url = `${this.endpoint}/v1.0/receta/emitir`;
        const medicamentos:Medicamento[] = receta.medicamentos.map(medicamento => {return {"codigo": medicamento, "cantidad": 1}})
        const body = {
            medicamentos: medicamentos,
            hash: receta.id
        };

        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        let data = await response.json();
        if ('string' === typeof data) {
            return data;
        } else {
            console.error(data)
            throw new Error('Error al emitir receta.');
        }
    }

    public async dispensar(receta: Receta, didFarmacia: string) : Promise<string> {
        const url = `${this.endpoint}/v1.0/receta/dispensar`;
        const body = {
            didFarmacia: didFarmacia,
            hash: receta.id
        };

        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        let data = await response.json();
        if ('string' === typeof data) {
            return data;
        } else {
            console.error(data)
            throw new Error('Error al dispensar receta.');
        }
    }

    public async getReceta(recetaId: string) : Promise<RecetaResponse> {
        const url = `${this.endpoint}/v1.0/receta/${recetaId}`;

        let response = await fetch(url, {
            method: 'GET'
        });

        let data = await response.json();
        // data tiene que ser un array de 4 posiciones.
        if (!Array.isArray(data) || data.length !== 4) {
            console.error(data)
            throw new Error('Error al obtener receta.');
        }

        // los medicamentos son un array que están en la posición 3.
        let medicamentos:Medicamento[] = data[3].map((medicamento: any) => {return {"codigo": medicamento[0], "cantidad": medicamento[1]}})

        return {
            "hash": data[0],
            "estado": data[1],
            "farmacia": data[2],
            "medicamentos": medicamentos
        }
    }
}

export default BlockchainPublisher;
