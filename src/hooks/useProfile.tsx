import React from 'react'
import { useIonAlert, useIonLoading, useIonToast } from '@ionic/react';
import ProfileService from '../service/ProfileService';
import RecetaBcData from '../service/RecetaBcData';
import { Role } from './useUserRole';
import Profile from '../model/Profile';
import { useHistory } from 'react-router';

interface UseProfileReturnTypes {
    create: (name: string, email: string) => void
    deletePerfil: (p: Profile) => void
    exportPerfil: (p: Profile) => void
    importPerfiles: () => void
}

type RoleTpes = "pac" | "med" | "far"

const ROLE_REDIRECT: { [ke in RoleTpes]: string } = {
    pac: "/receipts?type=my",
    med: "/receipts?type=emit",
    far: "/receipts?type=pending",
}

const useProfile = (role?: Role): UseProfileReturnTypes => {
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
                            history.push('/');
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

    const exportPerfil = (p: Profile) => {
        presentAlert({
            header: 'Exportar Perfil',
            message: '¿Está seguro de que desea exportar el perfil?',
            buttons: [
                'Cancelar',
                {
                    text: 'Exportar',
                    handler: () => {
                        console.log("Exportando perfil", p);
                        data.exportProfile(p.didId).then((p) => {
                            presentToast({
                                message: 'Perfil exportado.',
                                duration: 1000,
                                position: 'bottom'
                            });
                        }).catch((e) => {
                            presentAlert({
                                header: 'Error',
                                message: 'No se pudo exportar el perfil.',
                                buttons: ['OK']
                            });
                        });
                    }
                }
            ]
        })
    }

    const importPerfiles = () => {
        // debe presentar un cuadro para importar un archivo local
        // de la computadora. Una vez leído, se debe llamar a
        // data.importProfile(p: ProfileModel)
        let file = document.createElement('input');
        file.type = 'file';
        file.accept = 'application/json';
        file.onchange = async (e) => {
            let f = (e.target as HTMLInputElement).files![0];
            data.importProfile(f).then(() => {
                presentToast({
                    message: 'Perfil importado.',
                    duration: 1000,
                    position: 'bottom'
                });
            }).catch((msg) => {
                presentAlert({
                    header: 'Error',
                    message: 'No se pudo importar el perfil: ' + msg + '.',
                    buttons: ['OK']
                });
            });
        }

        file.click();
    }



    return { create, importPerfiles, exportPerfil, deletePerfil }
}

export default useProfile