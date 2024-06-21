import Profile from "../model/Profile";
import Receta from "../model/Receta";
import ProfileHandler from "../service/ProfileHandler";
import RecetaBcData, { RECETA_FOLDER_ARCHIVED, RECETA_FOLDER_FAVORITOS, RECETA_FOLDER_PAPELERA } from "../service/RecetaBcData";

class RecetaDecorator {

    private static instance: RecetaDecorator;
    private data: RecetaBcData;

    public static getInstance() {
        if (!RecetaDecorator.instance) {
            RecetaDecorator.instance = new RecetaDecorator(RecetaBcData.getInstance());
        }
        return RecetaDecorator.instance;
    }

    private constructor(data: RecetaBcData) {
        this.data = data;
    }

    public async decorate(receta: Receta) {
        receta.nombreMedico = this.getNombreMedico(receta);
        let list = await this.data.getRecetasFromFolder(RECETA_FOLDER_PAPELERA);
        receta.enCarpetaPapelera = list.some((r) => r.id === receta.id)
        list = await this.data.getRecetasFromFolder(RECETA_FOLDER_ARCHIVED);
        receta.enCarpetaArchivados = list.some((r) => r.id === receta.id)
        list = await this.data.getRecetasFromFolder(RECETA_FOLDER_FAVORITOS);
        receta.enCarpetaFavoritos = list.some((r) => r.id === receta.id)

        if (undefined === receta.estado) {
            receta.estado = 'emitida';
        }
    }

    private getNombreMedico(receta: Receta) : string {
        if (receta.certificado) {
            if (receta.certificado.credentialSubject && receta.certificado.credentialSubject["schema:author"]) {
                return receta.certificado.credentialSubject["schema:author"]["schema:name"] || "";
            }
        }
        return "";
    }
}

export default RecetaDecorator;
