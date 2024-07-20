import { CredentialStatus, IdType, Issuer, VerifiableCredential } from "@quarkid/vc-core";
import * as jsonld from "jsonld";

const documentCache = new Map<string, any>();

const CredencialBuilder = async(params: {
    vcInfo: {
        issuer: Issuer,
        expirationDate: Date,
        id: string,
        issuanceDate?: Date,
        credentialStatus?: CredentialStatus,
        credentialSchema?: IdType,
        refreshService?: IdType,
        types: string[]
    },
    context: string[],
    data: any
}): Promise<VerifiableCredential> => {

    let vc = new VerifiableCredential({
        "@context": params.context,
        issuer: params.vcInfo.issuer,
        expirationDate: params.vcInfo.expirationDate,
        id: params.vcInfo.id,
        issuanceDate: params.vcInfo.issuanceDate,
        credentialSubject: params.data,
        credentialStatus: params.vcInfo.credentialStatus,
        credentialSchema: params.vcInfo.credentialSchema,
        refreshService: params.vcInfo.refreshService,
    });

    vc.type = params.vcInfo.types;

    if (vc.type.indexOf("VerifiableCredential") == -1) {
        vc.type.push("VerifiableCredential");
    }

    // @ts-ignore
    const xhrDocumentLoader = jsonld.documentLoaders.xhr()

    // change the default document loader
    const customLoader = async (url:any, options:any) => {
        console.log("Custom loader", url)
        if (documentCache.has(url)) {
            return documentCache.get(url)
        }
        let ret = null

        if ('https://www.w3.org/2018/credentials/v1' === url) {
            console.log("Loading credentials-v1", url, options)
            const data = await fetch('/contexts/credentials-v1.jsonld')
            const response = await data.json()
            ret = {
                contextUrl: null,
                documentUrl: 'https://www.w3.org/2018/credentials/v1',
                document: response
            }
        } else {
            // call the default documentLoader
            ret = xhrDocumentLoader(url)
        }
        documentCache.set(url, ret)
        return ret
    };

    // @ts-ignore
    const compacted = await jsonld.compact(vc, vc["@context"], {documentLoader: customLoader});

    // @ts-ignore
    return compacted;
}

export default CredencialBuilder