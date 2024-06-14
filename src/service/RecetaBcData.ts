/**
 * Este servicio permite el amacenamiento local de la información, para ello se utiliza la librería localforage
 */

import localforage from 'localforage';
import Profile from '../model/Profile';
import { BehaviorSubject, Observable } from 'rxjs';
import Receta from '../model/Receta';

export type RecetaFolder = 'favoritos' | 'archivados' | 'papelera' | 'entrada' | 'salida';

export const RECETA_FOLDER_FAVORITOS: RecetaFolder = 'favoritos';
export const RECETA_FOLDER_ARCHIVED: RecetaFolder = 'archivados';
export const RECETA_FOLDER_PAPELERA: RecetaFolder = 'papelera';
export const RECETA_FOLDER_INBOX: RecetaFolder = 'entrada';
export const RECETA_FOLDER_OUTBOX: RecetaFolder = 'salida';

// TODO: Separar el currentProfile en otra clase.
export default class RecetaBcData {
    private static instance: RecetaBcData;
    private static readonly RECETAS_KEY = 'recetas';
    private static readonly FOLDER_KEY = 'folder';
    private static readonly PROFILES_KEY = 'profiles';
    private static readonly LASTMSG_KEY = 'lastmsg'
    private static readonly CURRENT_PROFILE_DID = 'did';

    private currentProfile: BehaviorSubject<Profile|null> = new BehaviorSubject<Profile|null>(null);
    private folderSuscription: BehaviorSubject<RecetaFolder> = new BehaviorSubject<RecetaFolder>('entrada');
    private storeData: LocalForage|null = null;
    private storeProfiles: LocalForage;
    
    public static getInstance(): RecetaBcData {
        if (!RecetaBcData.instance) {
            RecetaBcData.instance = new RecetaBcData();
        }
        return RecetaBcData.instance;
    }

    private constructor() {
        this.storeProfiles = localforage.createInstance({
            name: 'recetas-profiles',
        })

        // si no existe el array "profiles", lo creamos
        this.getProfiles().then(profiles => {
            if (!profiles) {
                this.storeProfiles.setItem(RecetaBcData.PROFILES_KEY, []);
            } else {
                // seteo el perfil actual, a partir del DID almacenado
                this.storeProfiles.getItem(RecetaBcData.CURRENT_PROFILE_DID).then((did) => {
                    if (did) {
                        let pp = profiles as Profile[];
                        let p = pp.find((profile: Profile) => profile.didId === did);
                        if (p) {
                            console.log('o', p);
                            this.setCurrentProfile(p);
                            this.currentProfile.next(p);
                        }
                    }
                });
            }
        });
    }

    public async setCurrentProfile(profile: Profile|null) {
        console.log("setCurrentProfile", profile)
        let name:string
        if (profile) {
            name = 'recetas-profiles-' + profile.didId
        } else {
            name = 'recetas-profiles'
        }
        this.storeData = localforage.createInstance({
            name: name
        })

        this.currentProfile.next(profile);
        if (profile) {
            this.storeProfiles.setItem(RecetaBcData.CURRENT_PROFILE_DID, profile.didId);
        }
    }

    public observeProfile(): Observable<Profile | null> {
        return this.currentProfile.asObservable();
    }

    public observeFolders(): Observable<RecetaFolder> {
        return this.folderSuscription.asObservable();
    }

    public getCurrentProfile(): Profile | null {
        return this.currentProfile.getValue();
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
        let p = await this.storeProfiles.getItem(RecetaBcData.PROFILES_KEY);
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

    /**
     * Guardo fecha hora del último mensaje
     */
    public async saveLastMessageDate(date: Date) {
        await this.ensureProfileData().setItem(this.buildKeyLastMessageDate(), date.toISOString());
    }

    /**
     * Obtengo la fecha hora del último mensaje
     */
    public async getLastMessageDate(): Promise<Date> {
        let date = await this.ensureProfileData().getItem(this.buildKeyLastMessageDate()) as string|null;
        if (!date) {
            // si no está, devuelvo 15 días para atrás
            console.log('No last message date. Default to 15 days ago.')
            return new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
        } else {
            return new Date(date);
        }
    }

    /**
     * Comienza el tratamiento de las recetas
     */

    /**
     * Guarda la receta en el almacenamiento local
     */
    public async saveReceta(receta: Receta, folder: RecetaFolder|null = null) {
        const key = this.buildKeyReceta(receta);
        await this.ensureProfileData().setItem(key, JSON.stringify(receta));

        if (folder) {
            await this.addRecetaToFolder(receta, folder);
        }
    }

    public async getReceta(id: string): Promise<Receta> {
        const key = this.buildKeyReceta(id);
        let receta = await this.ensureProfileData().getItem(key);
        if (!receta) {
            throw new Error('Receta not found');
        } else if (typeof receta === 'string') {
            return JSON.parse(receta);
        } else {
            throw new Error('Receta is not a string.');
        }
    }

    public async addRecetaToFolder(receta: Receta, folder: RecetaFolder) {
        let recetas = await this.getRecetasIdFromFolder(folder);
        if (!recetas.includes(receta.id!)) {
            recetas.push(receta.id!);
            await this.saveRecetasIdToFolder(folder, recetas);
            this.folderSuscription.next(folder as RecetaFolder);
        }
    }

    public async removeRecetaFromFolder(receta: Receta, folder: RecetaFolder) {
        let recetas = await this.getRecetasIdFromFolder(folder);
        let index = recetas.findIndex(id => id === receta.id);
        if (index !== -1) {
            recetas.splice(index, 1);
            await this.saveRecetasIdToFolder(folder, recetas);
            this.folderSuscription.next(folder as RecetaFolder);
        }
    }

    public async moveRecetaToFolder(receta: Receta, from: RecetaFolder, to: RecetaFolder) {
        await this.removeRecetaFromFolder(receta, from);
        await this.addRecetaToFolder(receta, to);
    }

    public async getRecetasFromFolder(folder: RecetaFolder): Promise<Receta[]> {
        let recetas = await this.ensureProfileData().getItem(this.buildKeyFolder(folder));
        if (!recetas) {
            return [];
        } else if (typeof recetas === 'string') {
            const ids = await this.getRecetasIdFromFolder(folder);
            let recetas: Receta[] = [];
            for (let id of ids) {
                recetas.push(await this.getReceta(id));
            }
            return recetas;
        } else {
            throw new Error('Recetas is not a string.');
        }
    }

    private ensureProfileData(): LocalForage {
        if (!this.storeData) {
            throw new Error('No current profile');
        }
        return this.storeData;
    }

    private async getRecetasIdFromFolder(folder: RecetaFolder): Promise<string[]> {
        if (!this.getCurrentProfile()) {
            return [];
        }
        let recetas = await this.ensureProfileData().getItem(this.buildKeyFolder(folder));
        if (!recetas) {
            return [];
        } else if (typeof recetas === 'string') {
            return JSON.parse(recetas);
        } else {
            throw new Error('Recetas is not a string.');
        }
    }

    private async saveRecetasIdToFolder(folder: RecetaFolder, recetaIds: string[]) {
        await this.ensureProfileData().setItem(this.buildKeyFolder(folder), JSON.stringify(recetaIds));
    }

    private async saveProfiles(profiles: Profile[]) {
        await this.storeProfiles.setItem(RecetaBcData.PROFILES_KEY, JSON.stringify(profiles));
    }

    private buildKeyReceta(receta: Receta|string) : string {
        if (typeof receta === 'string')
            return RecetaBcData.RECETAS_KEY + ":" + receta;
        else
            return this.buildKeyReceta(receta.id!);
    }

    private buildKeyFolder(folder: RecetaFolder) : string {
        return RecetaBcData.FOLDER_KEY + ":" + folder;
    }

    private buildKeyLastMessageDate() : string {
        return RecetaBcData.LASTMSG_KEY;
    }
}


