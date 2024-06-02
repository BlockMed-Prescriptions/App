
import { DIDUniversalResolver } from "@quarkid/did-resolver";
import { DIDDocument } from "@quarkid/did-core";
import { config as quarkidConfig } from "./config";

export const DIDResolver = async (didId : string) : Promise<DIDDocument> => {
    return new Promise<DIDDocument>((resolve, reject) => {
        const universalResolver = new DIDUniversalResolver({
            universalResolverURL: quarkidConfig.proxyEndpoint,
        });
    
        universalResolver.resolveDID(didId).then((didDocument) => {
            resolve(didDocument);
        }).catch((error) => {
            reject(error);
        })
    })
};