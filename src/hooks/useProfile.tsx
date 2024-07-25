import React from 'react'
import { useIonAlert, useIonLoading, useIonToast } from '@ionic/react';
import ProfileService from '../service/ProfileService';
import RecetaBcData from '../service/RecetaBcData';
import { Role } from './useUserRole';
import Profile from '../model/Profile';
import { useHistory } from 'react-router';

interface UseProfileReturnTypes {
    create: (name: string, email: string) => void
}

type RoleTpes = "pac" | "med" | "far"

const ROLE_REDIRECT: { [ke in RoleTpes]: string } = {
    pac: "/receipts?type=my",
    med: "/receipts?type=emit",
    far: "/receipts?type=pending",
}

const useProfile = (role: Role): UseProfileReturnTypes => {
    const [presentAlert] = useIonAlert();
    const [presentLoading, dismissLoading] = useIonLoading();
    const [presentToast] = useIonToast();
    const history = useHistory();
    const perfilService = ProfileService.getInstance();
    const data = RecetaBcData.getInstance();

    const create = (name: string, email: string) => {
        if (!role) return;
        // pregunto si está seguro
        presentAlert({
            header: 'Confirmación de creación de perfil',
            message: '¿Está seguro de crear el perfil?',
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'OK',
                    handler: async () => {
                        await presentLoading({
                            message: 'Creando perfil...',
                            spinner: 'bubbles'
                        });
                        let roles: string[] = [role];
                        let profile = await perfilService.createProfile(name, email, roles)
                        await dismissLoading();
                        await data.addProfile(profile);
                        await data.setCurrentProfile(profile);
                        history.push(ROLE_REDIRECT[role]);
                    }
                }
            ]
        });
    }

    const deletePerfil = (p: Profile) => {
        presentAlert({
            header: "Eliminar Perfil",
            message: "¿Está seguro de que desea eliminar el perfil?",
            buttons: [
                'Cancelar',
                {
                    text: 'Eliminar',
                    handler: () => {
                        data.deleteProfile(p.didId).then(() => {
                            presentToast({
                                message: 'Perfil eliminado.',
                                duration: 1000,
                                position: 'bottom'
                            });
                            data.setCurrentProfile(null);

                            // me voy al Inbox
                            history.push('/folder/Inbox');
                        }).catch((e) => {
                            presentAlert({
                                header: 'Error',
                                message: 'No se pudo eliminar el perfil.',
                                buttons: ['OK']
                            });
                        });
                    }
                }
            ]
        })
    }



    return { create }
}

export default useProfile