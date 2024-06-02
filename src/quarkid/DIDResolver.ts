
import { DIDDocument } from "@quarkid/did-core";
import { config as quarkidConfig } from "./config";

let DIDUniversalResolver: any;

export const DIDResolver = async (didId : string) : Promise<DIDDocument> => {
    // Carga DIDUniversalResolver sólo cuando se necesita
    if (!DIDUniversalResolver) {
        DIDUniversalResolver = (await import("@quarkid/did-resolver")).DIDUniversalResolver;
    }
    return new Promise<DIDDocument>((resolve, reject) => {
        const universalResolver = new DIDUniversalResolver({
            universalResolverURL: quarkidConfig.proxyEndpoint,
        });
    
        universalResolver.resolveDID(didId).then((didDocument: DIDDocument) => {
            resolve(didDocument);
        }).catch((error: any) => {
            reject(error);
        })
    })
};