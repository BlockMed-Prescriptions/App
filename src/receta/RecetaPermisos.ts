import Profile from "../model/Profile";
import Receta from "../model/Receta";
import ProfileHandler from "../service/ProfileHandler";


class RecetaPermisos {
    private static instance: RecetaPermisos;

    public static getInstance() {
        if (!RecetaPermisos.instance) {
            RecetaPermisos.instance = new RecetaPermisos();
        }
        return RecetaPermisos.instance;
    }

    public canSendFarmacia(receta: Receta, profile: Profile) : boolean {
        if (ProfileHandler.isPaciente(profile) && profile.didId === receta.didPaciente && receta.estado === 'emitida') {
            return true;
        } else {
            return false;
        }
    }

    public canDispensa(receta: Receta, profile: Profile) : boolean {
        if (ProfileHandler.isFarmacia(profile) && receta.estado === 'enviada-farmacia') {
            return true;
        } else {
            return false;
        }
    }

    public canConfirmarDispensa(receta: Receta, profile: Profile) : boolean {
        if (ProfileHandler.isPaciente(profile) && profile.didId === receta.didPaciente && receta.estado === 'pendiente-confirmacion-dispensa') {
            return true;
        } else {
            return false;
        }
    }
}

export default RecetaPermisos;