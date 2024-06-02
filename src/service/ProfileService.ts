import Profile from '../model/Profile';

import { KMSClient } from "@quarkid/kms-client"
import { IJWK, LANG, Suite } from "@quarkid/kms-core"
import { ProfileKMSSecureStorage } from '../quarkid/ProfileKMSSecureStorage';
import { DIDBuilder } from '../quarkid/DIDBuilder';
import { DIDResolver } from '../quarkid/DIDResolver';


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
            didId: ''
        };
        const kms = this.getKms(profile);

        const updateKey = await kms.create(Suite.ES256k);
        const recoveryKey = await kms.create(Suite.ES256k);
        const didComm = await kms.create(Suite.DIDComm);
        const bbsbls = await kms.create(Suite.Bbsbls2020);
        profile.didId = await DIDBuilder(updateKey.publicKeyJWK, recoveryKey.publicKeyJWK, didComm.publicKeyJWK, bbsbls.publicKeyJWK);

        return profile;
    }

    private getKms(profile: Profile) : KMSClient {
        return new KMSClient({
            lang: LANG.es,
            storage: new ProfileKMSSecureStorage(profile),
            didResolver: DIDResolver
        });
    }
}

export default ProfileService;