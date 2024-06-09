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


    // TODO: esto debe optimizarse usando un mock de axios
    let num = axios.interceptors.request.use((config) => {
        console.log('Axios request:', config);
        if (config.url === "https://extrimian.blob.core.windows.net/rskec/securitybbsv1.jsonld") {
            // @ts-ignore
            config.url = vc["@context"][1];
        } else if (config.url === "https://extrimian.blob.core.windows.net/rskec/credentialsv1.jsonld") {
            // @ts-ignore
            config.url = vc["@context"][2];
        }
        return config;
    });

    const result = await service.verify(vc, new AssertionMethodPurpose());

    // y ahora quiero sacar los interceptors
    axios.interceptors.request.eject(num);

    return result;
};