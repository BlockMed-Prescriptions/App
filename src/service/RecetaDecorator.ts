import Receta from "../model/Receta";

class RecetaDecorator {
    public getNombreMedico(receta: Receta) : string {
        if (receta.certificado) {
            if (receta.certificado.credentialSubject && receta.certificado.credentialSubject["schema:author"]) {
                return receta.certificado.credentialSubject["schema:author"]["schema:name"] || "";
            }
        }
        return "";
    }
}

export default RecetaDecorator;
