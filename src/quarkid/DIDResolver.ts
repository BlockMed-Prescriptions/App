
import { DIDDocument } from "@quarkid/did-core";
import { config as quarkidConfig } from "./config";

import { DIDUniversalResolver } from "./local/did-resolver"
export const DIDResolver = async (didId : string) : Promise<DIDDocument> => {
    // Carga DIDUniversalResolver sólo cuando se necesita
    return new Promise<DIDDocument>((resolve, reject) => {
        const universalResolver = new DIDUniversalResolver({
            universalResolverURL: quarkidConfig.proxyEndpoint,
        });
    
        universalResolver.resolveDID(didId).then((didDocument: DIDDocument|null) => {
            if (!didDocument) {
                reject("DID not found");
            } else {
                resolve(didDocument);
            }
        }).catch((error: any) => {
            reject(error);
        })
    })
};