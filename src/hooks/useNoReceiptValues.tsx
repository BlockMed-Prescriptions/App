import React, { useMemo } from 'react'
import useQuery from './useQuery';
import useCurrentProfile from './useCurrentProfile';

const useNoReceiptValues = (): { type: string, text: string[] } => {
    const { query } = useQuery(["type"]);
    const { currentProfile } = useCurrentProfile();
    return useMemo(() => {
        const role = currentProfile?.roles ? currentProfile.roles[0] : "";
        if (role === "pac" && query?.type === "my") {
            return {
                type: "med",
                text: [
                    "¡Aún no hay recetas médicas aquí!",
                    "Aparecerán cuando el médico las genere",
                ],
            };
        }
        if (role === "pac" && query?.type === "sent") {
            return {
                type: "pac",
                text: [
                    "¡Todavía no has enviado ninguna receta!",
                    "Aparecerán aquí cuando las compartas con alguien",
                ],
            };
        }
        if (role === "med" && query?.type === "emit") {
            return {
                type: "med",
                text: [
                    "¡Aún no hay recetas médicas aquí!",
                    "Comienza a crearlas ahora",
                ],
            };
        }
        if (role === "far" && query?.type === "pending") {
            return {
                type: "far",
                text: [
                    "¡Aún no hay recetas médicas aquí!",
                    "Aparecerán cuando los clientes las envíen",
                ],
            };
        }
        if (role === "far" && query?.type === "dispens_made") {
            return {
                type: "far",
                text: [
                    "¡Todavía no has realizado ninguna dispensa!",
                    "Aparecerán aquí cuando las registres",
                ],
            };
        }
        return {
            type: "",
            text: [""],
        };
    }, [currentProfile, query?.type]);
}

export default useNoReceiptValues