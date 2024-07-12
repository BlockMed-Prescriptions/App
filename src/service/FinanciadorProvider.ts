import { config } from "../quarkid/config";

type Financiador = {
    did: string,
    nombre: string,
}

class FinanciadorProvider
{
    private static instance: FinanciadorProvider;

    public static getInstance(): FinanciadorProvider
    {
        if (!FinanciadorProvider.instance) {
            FinanciadorProvider.instance = new FinanciadorProvider(config.financiadorEndpoint);
        }

        return FinanciadorProvider.instance;
    }

    private endpointUrl: string;
    private cache: Financiador[] = [];
    private readed: boolean = false;

    private constructor(endpointUrl: string)
    {
        this.endpointUrl = endpointUrl;
    }

    public async getFinanciadores(): Promise<Financiador[]>
    {
        await this.loadFinanciadores()
        return this.cache;
    }


    private async loadFinanciadores() : Promise<void>
    {
        if (this.readed) {
            return;
        }

        const url = this.endpointUrl
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        let data = await response.json();
        if (Array.isArray(data)) {
            this.cache = data;
            this.readed = true;
        } else {
            console.error(data)
            throw new Error('Error al cargar financiadores.');
        }
    }

}

export default FinanciadorProvider;