/**
 * Este servicio permite el amacenamiento local de la información, para ello se utiliza la librería localforage
 */

import localforage from 'localforage';
import Profile from '../model/Profile';
import { Observable, Subject } from 'rxjs';
import Receta from '../model/Receta';
import Semaforo from './Semaforo';
import Transaccion from '../model/Transaccion';

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

    // TODO todos estos Subjects deben pasar a otra clase.
    private currentProfileSubject: Subject<Profile|null> = new Subject<Profile|null>();
    private currentProfile: Profile|null = null;
    private folderSuscription: Subject<RecetaFolder> = new Subject<RecetaFolder>();
    private newRecetaSubject: Subject<Receta> = new Subject<Receta>();
    private storeData: LocalForage|null = null;
    private storeProfiles: LocalForage;
    private semaforo: Semaforo;
    
    public static getInstance(): RecetaBcData {
        if (!RecetaBcData.instance) {
            RecetaBcData.instance = new RecetaBcData();
            RecetaBcData.instance.loadCurrentProfile().then( (profile) => {
                console.log('Current profile loaded', profile)
            })
        }
        return RecetaBcData.instance;
    }

    private constructor() {
        this.semaforo = new Semaforo();
        this.storeProfiles = localforage.createInstance({
            name: 'recetas-profiles',
        })
    }

    public async setCurrentProfile(profile: Profile|null) {
        let name:string
        if (profile) {
            name = 'recetas-profiles-' + profile.didId
            this.storeData = localforage.createInstance({
                name: name
            })
        } else {
            this.storeData = null
        }

        this.currentProfile = profile;
        this.currentProfileSubject.next(profile);
        if (profile) {
            await this.storeProfiles.setItem(RecetaBcData.CURRENT_PROFILE_DID, profile.didId);
        }
    }

    public async loadCurrentProfile() {
        let didId = await this.storeProfiles.getItem(RecetaBcData.CURRENT_PROFILE_DID) as string|null;
        if (didId) {
            let profiles = await this.getProfiles();
            let profile = profiles.find(p => p.didId === didId);
            if (profile) {
                await this.setCurrentProfile(profile);
            }
        }
        return this.currentProfile;
    }

    public observeProfile(): Observable<Profile | null> {
        return this.currentProfileSubject.asObservable();
    }

    public observeFolders(): Observable<RecetaFolder> {
        return this.folderSuscription.asObservable();
    }

    public observeRecetas(): Observable<Receta> {
        return this.newRecetaSubject.asObservable()
    }

    public getCurrentProfile(): Profile | null {
        return this.currentProfile
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
        const releaseLock = await this.semaforo.acquireLock()
        try {
            const profiles = await this.getProfiles();
            // chequeo que el perfil no exista
            if (profiles.find(p => p.name === profile.name)) {
                throw new Error('Profile already exists');
            }

            console.log("Profile a guardar", profile, JSON.stringify(profile))
            profiles.push(profile);
            await this.saveProfiles(profiles);
        } finally  {
            releaseLock();
        }
    }

    public async deleteProfile(didId: string) {
        const releaseLock = await this.semaforo.acquireLock()
        try {
            let profiles = await this.getProfiles();
            let index = profiles.findIndex((profile: Profile) => profile.didId === didId);

            if (index === -1) {
                throw new Error('Profile not found');
            }

            profiles.splice(index, 1);
            await this.saveProfiles(profiles);
        } finally {
            releaseLock();
        }
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
        this.newRecetaSubject.next(receta);
    }

    public async getReceta(id: string): Promise<Receta> {
        const key = this.buildKeyReceta(id);
        let receta = await this.ensureProfileData().getItem(key);
        if (!receta) {
            throw new Error('Receta not found');
        } else if (typeof receta === 'string') {
            let data:any = JSON.parse(receta);
            if (data.fechaEmision && typeof data.fechaEmision === 'string') {
                data.fechaEmision = new Date(data.fechaEmision);
            }
            if (data.fechaVencimiento && typeof data.fechaVencimiento === 'string') {
                data.fechaVencimiento = new Date(data.fechaVencimiento);
            }
            return data as Receta
        } else {
            throw new Error('Receta is not a string.');
        }
    }

    public async deleteReceta(receta: Receta) {
        const releaseLock = await this.semaforo.acquireLock()
        try {
            await this.safeDeleteReceta(receta);
        } finally {
            releaseLock();
        }
    }

    public async getAllRecetas(): Promise<Receta[]> {
        let recetas = await this.ensureProfileData().keys();
        let result: Receta[] = [];
        for (let key of recetas) {
            if (key.startsWith(RecetaBcData.RECETAS_KEY)) {
                let receta = await this.getReceta(key.replace(RecetaBcData.RECETAS_KEY + ":", ''));
                result.push(receta);
            }
        }
        return result;
    }

    public async addRecetaToFolder(receta: Receta, folder: RecetaFolder) {
        const releaseLock = await this.semaforo.acquireLock()
        try {
            await this.safeAddRecetaToFolder(receta, folder);
        } finally {
            releaseLock();
        }
    }

    public async addTransaccionToReceta(receta: Receta, transaccion: Transaccion) {
        const releaseLock = await this.semaforo.acquireLock()
        try {
            if (!receta.transacciones.find((t) => t.hashTransaccion === transaccion.hashTransaccion)) {
                if (!Array.isArray(receta.transacciones)) {
                    receta.transacciones = [];
                }
                if ('emision' === transaccion.tipo) {
                    receta.transactionHashEmision = transaccion.hashTransaccion
                } else if ('dispensa' === transaccion.tipo) {
                    receta.transactionHashDispensa = transaccion.hashTransaccion
                }
                receta.transacciones.push(transaccion)
                await this.saveReceta(receta);
                return true
            } else {
                return false
            }
        } finally {
            releaseLock();
        }
    }

    private async safeAddRecetaToFolder(receta: Receta, folder: RecetaFolder) {
        let recetas = await this.getRecetasIdFromFolder(folder);
        if (!recetas.includes(receta.id!)) {
            recetas.push(receta.id!);
            await this.saveRecetasIdToFolder(folder, recetas);
            setTimeout(() => this.folderSuscription.next(folder as RecetaFolder))
        }
    }

    private async safeDeleteReceta(receta: Receta) {
        await this.ensureProfileData().removeItem(this.buildKeyReceta(receta));
        for (let folder of [RECETA_FOLDER_FAVORITOS, RECETA_FOLDER_ARCHIVED, RECETA_FOLDER_PAPELERA, RECETA_FOLDER_INBOX, RECETA_FOLDER_OUTBOX]) {
            await this.safeRemoveRecetaFromFolder(receta, folder);
        }
    }

    public async removeRecetaFromFolder(receta: Receta, folder: RecetaFolder) {
        const releaseLock = await this.semaforo.acquireLock()
        try {
            this.safeRemoveRecetaFromFolder(receta, folder);
        } finally {
            releaseLock();
        }
    }

    private async safeRemoveRecetaFromFolder(receta: Receta, folder: RecetaFolder) {
        let recetas = await this.getRecetasIdFromFolder(folder);
        let index = recetas.findIndex(id => id === receta.id);
        if (index !== -1) {
            recetas.splice(index, 1);
            await this.saveRecetasIdToFolder(folder, recetas);
            setTimeout(() => this.folderSuscription.next(folder as RecetaFolder))
        }
    }

    public async moveRecetaToFolder(receta: Receta, from: RecetaFolder, to: RecetaFolder) {
        const releaseLock = await this.semaforo.acquireLock()
        try {
            await this.safeRemoveRecetaFromFolder(receta, from);
            await this.safeAddRecetaToFolder(receta, to);
        } finally {
            releaseLock();
        }
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
        console.log("Profiles a guardar", profiles)
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


