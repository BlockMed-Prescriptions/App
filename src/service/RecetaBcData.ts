/**
 * Este servicio permite el amacenamiento local de la información, para ello se utiliza la librería localforage
 */

import localforage from 'localforage';
import Profile from '../model/Profile';
import { BehaviorSubject, Observable } from 'rxjs';

// TODO: Separar el currentProfile en otra clase.
export default class RecetaBcData {
    private static instance: RecetaBcData;
    private static readonly RECETAS_KEY = 'recetas';
    private static readonly FAVORITOS_KEY = 'favoritos';
    private static readonly ARCHIVADOS_KEY = 'archivados';
    private static readonly PAPELERA_KEY = 'papelera';
    private static readonly PROFILES_KEY = 'profiles';
    private static readonly CURRENT_PROFILE_DID = 'did';

    private currentProfile: BehaviorSubject<Profile|null> = new BehaviorSubject<Profile|null>(null);
    
    public static getInstance(): RecetaBcData {
        if (!RecetaBcData.instance) {
            RecetaBcData.instance = new RecetaBcData();
        }
        return RecetaBcData.instance;
    }

    private constructor() {
        localforage.config({
            name: 'RecetaBcData',
        });

        // si no existe el array "profiles", lo creamos
        this.getProfiles().then(profiles => {
            if (!profiles) {
                localforage.setItem(RecetaBcData.PROFILES_KEY, []);
            } else {
                // seteo el perfil actual, a partir del DID almacenado
                localforage.getItem(RecetaBcData.CURRENT_PROFILE_DID).then((did) => {
                    if (did) {
                        let pp = profiles as Profile[];
                        let p = pp.find((profile: Profile) => profile.didId === did);
                        if (p) {
                            console.log('o', p);
                            this.currentProfile.next(p);
                        }
                    }
                });
            }
        });

        localforage.keys().then((keys) => {
            console.log('keys', keys);
        });
    }

    public async setCurrentProfile(profile: Profile|null) {
        console.log("setCurrentProfile", profile)
        this.currentProfile.next(profile);
        if (profile)
            localforage.setItem(RecetaBcData.CURRENT_PROFILE_DID, profile.didId);
    }

    public getCurrentProfile(): Observable<Profile | null> {
        return this.currentProfile.asObservable();
    }

    /**
     * TODO: Mover esto a otra clase. Debe recibir un perfil.
     */
    public async exportProfile(didId: string): Promise<void> {
        // busco el profile por el didId
        let profiles = await this.getProfiles();
        let p = profiles.find(profile => profile.didId === didId);

        if (!p) {
            throw new Error('Profile not found');
        }

        // exporto el perfil
        let data = JSON.stringify(p);
        let blob = new Blob([data], { type: 'application/json' });
        let url = URL.createObjectURL(blob);

        let a = document.createElement('a');
        a.href = url;
        a.download = 'profile'+ didId +'.json';

        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        return;
    }

    /**
     * TODO: Mover esto a otra clase. Debe recibir un perfil.
     */
    public async importProfile(file: File): Promise<void> {
        let reader = new FileReader();
        reader.readAsText(file);

        const promise = new Promise<void>((resolve, reject) => {
            reader.onload = async () => {
                let data = JSON.parse(reader.result as string);
                let profile = data;
                try {
                    await this.addProfile(profile);
                    resolve();
                } catch (e: any) {
                    reject(e.message);
                }
            }
        })

        return promise;
    }

    public async getProfiles(): Promise<Profile[]> {
        let p = await localforage.getItem(RecetaBcData.PROFILES_KEY);
        if (!p) {
            return [];
        } else if (typeof p === 'string') {
            return JSON.parse(p);
        } else {
            throw new Error('Profiles is not a string.');
        }
    }

    public async getProfile(name: string): Promise<Profile> {
        const profiles = await this.getProfiles();
        let p = profiles.find(profile => profile.name === name);

        if (!p) {
            throw new Error('Profile not found');
        } else {
            return p;
        }
    }

    public async addProfile(profile: Profile) {
        const profiles = await this.getProfiles();
        // chequeo que el perfil no exista
        if (profiles.find(p => p.name === profile.name)) {
            throw new Error('Profile already exists');
        }

        profiles.push(profile);
        await this.saveProfiles(profiles);
    }

    public async deleteProfile(didId: string) {
        let profiles = await this.getProfiles();
        let index = profiles.findIndex((profile: Profile) => profile.didId === didId);

        if (index === -1) {
            throw new Error('Profile not found');
        }

        profiles.splice(index, 1);
        await this.saveProfiles(profiles);
    }

    private async saveProfiles(profiles: Profile[]) {
        await localforage.setItem(RecetaBcData.PROFILES_KEY, JSON.stringify(profiles));
    }
}

