import { VerifiableCredential } from "@quarkid/vc-core";
import Profile from "../model/Profile";

import { VCVerifierService } from "@quarkid/vc-verifier";
import { DIDResolver } from "./DIDResolver";
import { AssertionMethodPurpose, Purpose } from "@quarkid/did-core";

import axios from 'axios';

export const CredentialVerifier = async (vc: VerifiableCredential, profile: Profile) => {
    const service = new VCVerifierService({
        didDocumentResolver: DIDResolver
    });

    let num = null
    try {
        // TODO: esto debe optimizarse usando un mock de axios
        num = axios.interceptors.request.use((config) => {
            console.log('Axios request:', config.url);
            if (config.url === "https://extrimian.blob.core.windows.net/rskec/securitybbsv1.jsonld") {
                // @ts-ignore
                // config.url = vc["@context"][1];
                config.url = "contexts/rskec-securitybbsv1.jsonld"
            } else if (config.url === "https://extrimian.blob.core.windows.net/rskec/credentialsv1.jsonld") {
                // @ts-ignore
                // config.url = vc["@context"][2];
                config.url = "contexts/rskec-credentialsv1.jsonld"
            }
            return config;
        });

        return await service.verify(vc, new AssertionMethodPurpose());
    } finally {
        // y ahora quiero sacar los interceptors
        if (num !== null)
            axios.interceptors.request.eject(num);
    }
};