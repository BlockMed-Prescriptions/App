import Profile from '../model/Profile';


import { Suite } from "@quarkid/kms-core"
import { DIDBuilder } from '../quarkid/DIDBuilder';
import { DIDResolver } from '../quarkid/DIDResolver';
import { buildKms } from './KmsFactory';

class ProfileService {
    private static instance: ProfileService;

    public static getInstance(): ProfileService {
        if (!ProfileService.instance) {
            ProfileService.instance = new ProfileService();
        }
        return ProfileService.instance;
    }

    public async createProfile(name: string, email: string, roles: string[]): Promise<Profile> {
        const profile: Profile = {
            name: name,
            email: email,
            roles: roles,
            keyStorage: new Map<string, any>(),
            didId: '',
            seed: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        };
        const kms = await this.getKms(profile);

        const updateKey = await kms.create(Suite.ES256k);
        const recoveryKey = await kms.create(Suite.ES256k);
        const didComm = await kms.create(Suite.DIDComm);
        const bbsbls = await kms.create(Suite.RsaSignature2018);
        profile.didId = await DIDBuilder(updateKey.publicKeyJWK, recoveryKey.publicKeyJWK, didComm.publicKeyJWK, bbsbls.publicKeyJWK);

        return profile;
    }

    private async getKms(profile: Profile) {
        return await buildKms(profile);
    }
}

export default ProfileService;