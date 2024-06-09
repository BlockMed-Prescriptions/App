import { KMSStorage } from "@quarkid/kms-core";
import Profile from "../model/Profile";

export class ProfileKMSSecureStorage implements KMSStorage {

    private profile: Profile;

    constructor(profile: Profile) {
        this.profile = profile;
    }
  
    async add(key: string, data: any): Promise<void> {
        this.profile.keyStorage[key] = data;
    }
  
    async get(key: string): Promise<any> {
        return this.profile.keyStorage[key];
    }
  
    async getAll(): Promise<Map<string, any>> {
        return new Map(Object.entries(this.profile.keyStorage));
    }
  
    update(key: string, data: any) {
        this.profile.keyStorage[key] = data;
    }
  
    remove(key: string) {
        this.profile.keyStorage.delete(key);
    }
}
  
  