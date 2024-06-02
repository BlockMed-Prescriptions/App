import { KMSStorage } from "@quarkid/kms-core";
import Profile from "../model/Profile";

export class ProfileKMSSecureStorage implements KMSStorage {

    private profile: Profile;

    constructor(profile: Profile) {
        this.profile = profile;
    }
  
    async add(key: string, data: any): Promise<void> {
        const map = this.profile.keyStorage;
        map.set(key, data);
    }
  
    async get(key: string): Promise<any> {
        return this.profile.keyStorage.get(key);
    }
  
    async getAll(): Promise<Map<string, any>> {
        return this.profile.keyStorage;
    }
  
    update(key: string, data: any) {
        this.profile.keyStorage.set(key, data);
    }
  
    remove(key: string) {
        this.profile.keyStorage.delete(key);
    }
}
  
  