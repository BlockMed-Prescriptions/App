import { DIDDocumentUtils } from "@quarkid/did-core";
import Profile from "../model/Profile"
import { DIDResolver } from "../quarkid/DIDResolver";
import MessageStorageService from "./MessageStorageService";
import { DWNClient } from "@quarkid/dwn-client";

const cache = new Map<string, DWNClient>(); 
const cacheUrl = new Map<string, string>();

export const DIDServiceUrl = async (did: string) : Promise<string> => {
    if (cacheUrl.has(did)) {
        return cacheUrl.get(did)!;
    }

    const didDocument = await DIDResolver(did);
    if (!didDocument) {
        console.log("No DID Document found for target.");
        throw new Error("No DID Document found for target.");
    }
    const service = DIDDocumentUtils.getServiceUrl(didDocument, "DecentralizedWebNode", "nodes");
    if (!service) {
        console.log("Services", service);
        console.error("No service found in DID Document.");
        throw new Error("No service found in DID Document.");
    }
    const url = service[0];

    cacheUrl.set(did, url)
    return url
}


export const DwnFactory = async (emisor: string) : Promise<DWNClient> => {
    if (cache.has(emisor)) {
        return cache.get(emisor)!;
    }

    const dwnClient = new DWNClient({
        did : emisor,
        inboxURL : await DIDServiceUrl(emisor),
        storage : MessageStorageService.getInstance(),
      })
    
    cache.set(emisor, dwnClient)
    return dwnClient
}

export default DwnFactory