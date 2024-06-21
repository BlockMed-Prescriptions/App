import { LANG, Suite } from '@quarkid/kms-core';
import Profile from '../model/Profile';
import { ProfileKMSSecureStorage } from '../quarkid/ProfileKMSSecureStorage';
import { DIDResolver } from '../quarkid/DIDResolver';
import { KMSClient } from "@extrimian/kms-client";
import { RSASignature2018SuiteRemake } from '../quarkid/local/rsa-signature-2018-suite-remake';

let KMS : any|null = null;
const cache = new Map<string, any>();

export const buildKms = async (profile: Profile)  : Promise<KMSClient> => {
    if (null === KMS) {
        KMS = (await import('@extrimian/kms-client')).KMSClient;
    }
    let key = profile.seed + profile.name.replace(/\s/g, '') + profile.email.replace(/\s/g, '');

    console.log("Building KMS for profile", profile.didId)
    if (cache.has(key)) {
        console.log("Returning cached KMS for profile", profile.didId)
        return cache.get(key);
    }

    console.log("Creating new KMS for profile", profile.didId)
    let kms = new KMS({
        lang: LANG.es,
        storage: new ProfileKMSSecureStorage(profile),
        didResolver: DIDResolver,
        mobile: true
    });

    // cambio la suite de firma Rsasignature2018, por una modificada
    // dado que la original no funciona al firmar, dado que utiliza
    // validadores que fallan por CORS.
    kms.suites.set(Suite.RsaSignature2018, RSASignature2018SuiteRemake)

    cache.set(key, kms)

    return kms
}
