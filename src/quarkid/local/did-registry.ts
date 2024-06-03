import { Purpose } from "@extrimian/did-core";

import { DIDDocumentMetadata, ModenaDid,
    ModenaDocumentModel,
    ModenaPublicKeyModel,
    ModenaPublicKeyPurpose,
    ModenaRequest,
    ModenaSdkConfig
} from "@extrimian/modena-sdk";

import { IJWK, KMSStorage, LANG, Suite } from "@extrimian/kms-core";
import { Service } from '@extrimian/did-core';

export interface ProcessResult {
    canonicalId: string;
    recoveryKey: any[];
    updateKey: any[];
    didCommKey: any;
    bbsBls2020Key: any;
}

export interface IPublicKeys {
    recoveryKey?: IJWK[];
    updateKey?: IJWK[];
    bbsBlsJwk?: IJWK;
    didCommJwk?: IJWK;
}

export interface VerificationMethod {
    id: string,
    type: string,
    publicKeyJwk: IJWK,
    purpose: Purpose[],
}

export interface IKeys {
    verificationMethods?: VerificationMethod[];
}

export interface CreateDIDResponse {
    recoveryKeys: IJWK[];
    updateKeys: IJWK[];
    document: ModenaDocumentModel;
    longDid: string;
    didUniqueSuffix: string;
}

export interface PublishDIDResponse {
    canonicalId: string;
    did: string;
    longDid: string;
}

// file publish-did-request.ts
export class PublishDIDRequest {
    createDIDResponse!: CreateDIDResponse;
    apiKey?: {
        fieldName?: string,
        value: string,
        type?: "header" | "queryParam"
    };
}

// file update-did-request.ts
export type UpdateDIDRequest = {
    apiKey?: {
        fieldName?: string,
        value: string,
        type?: "header" | "queryParam"
    };
    updateApiUrl: string;
    didSuffix: string;
    signer: (content: any) => Promise<string>;
    updatePublicKey: IJWK;
    newUpdateKeys: IJWK[];
    updateKeysToRemove?: {
        publicKeys?: IJWK[];
        updateCommitment?: string[];
    };
    documentMetadata: DIDDocumentMetadata;
    verificationMethodsToAdd?: VerificationMethod[];
    idsOfVerificationMethodsToRemove?: string[];
    servicesToAdd?: Service[];
    idsOfServiceToRemove?: string[];
}


// file modena-registry.service.ts
export abstract class ModenaRegistryBase<TPublishRequest extends PublishDIDRequest> {

    async create(
        createApiUrl: string,
        initialPublicKeys: IPublicKeys,
        storage: KMSStorage,
        services?: Service[],
        mobile?: boolean
    ): Promise<ProcessResult> {
        let recoveryKey = initialPublicKeys.recoveryKey;
        let updateKey = initialPublicKeys.updateKey;
        let didCommJwk = initialPublicKeys.didCommJwk;
        let bbsBlsJwk = initialPublicKeys.bbsBlsJwk;

        if (!recoveryKey) {
            recoveryKey = [];
        }

        if (!updateKey) {
            updateKey = [];
        }

        const publicKeyDidComm: ModenaPublicKeyModel = {
            id: "did-comm",
            type: "X25519KeyAgreementKey2019",
            publicKeyJwk: didCommJwk ||  {kty: "OKP", crv: "X25519", x: "", y: ""},
            purposes: [ModenaPublicKeyPurpose.KeyAgreement],
        };

        const publicKeyBbs: ModenaPublicKeyModel = {
            id: "vc-bbs",
            type: "Bls12381G1Key2020",
            publicKeyJwk: bbsBlsJwk || {kty: "OKP", crv: "Ed25519", x: "", y: ""},
            purposes: [ModenaPublicKeyPurpose.AssertionMethod],
        };

        const publicKeys: ModenaPublicKeyModel[] = [publicKeyDidComm, publicKeyBbs];
        const document: ModenaDocumentModel = {
            publicKeys,
            services,
        };

        const input = { recoveryKeys: recoveryKey, updateKeys: updateKey, document };
        const request = ModenaRequest.createCreateRequest(input);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        };

        const response = await fetch(createApiUrl, options);

        if (response.status !== 200 && response.status !== 201) {
            const msg = await response.json();
            throw new Error(`DID creation is not ok: ${msg}`);
        }
        const { canonicalId } = ((await response.json()) as any)
            .didDocumentMetadata;

        return {
            canonicalId,
            recoveryKey: { ...recoveryKey },
            updateKey: { ...updateKey},
            didCommKey: didCommJwk,
            bbsBls2020Key: bbsBlsJwk
        };
    }

    async createDID(params: {
        updateKeys: IJWK[],
        recoveryKeys: IJWK[],
        verificationMethods: VerificationMethod[],
        services?: Service[],
        didMethod?: string,
    }): Promise<CreateDIDResponse> {

        if (ModenaSdkConfig.maxCanonicalizedDeltaSizeInBytes < 2000) {
            ModenaSdkConfig.maxCanonicalizedDeltaSizeInBytes = 2000;
        }

        let updateKeys = params.updateKeys;
        let recoveryKeys = params.recoveryKeys;

        const publicKeys: ModenaPublicKeyModel[] = params.verificationMethods.map(vm => {
            return {
                id: vm.id,
                publicKeyJwk: vm.publicKeyJwk,
                type: vm.type,
                purposes: vm.purpose.map(x => x.name as ModenaPublicKeyPurpose),
            }
        });

        const document: ModenaDocumentModel = {
            publicKeys,
            services: params.services,
        };

        ModenaSdkConfig.network = params.didMethod as any;

        const longDid = await ModenaDid.createLongFormDid({ recoveryKeys, updateKeys, document });

        return {
            recoveryKeys: recoveryKeys,
            updateKeys: updateKeys,
            document,
            longDid,
            didUniqueSuffix: longDid.substring(longDid.substring(0, longDid.lastIndexOf(":")).lastIndexOf(":") + 1)
        };
    }

    abstract updateDID(params: UpdateDIDRequest): Promise<void>;

    async publish(did: string): Promise<string> {
        return did;
    }

    abstract publishDID(request: TPublishRequest): Promise<PublishDIDResponse>;
}



// file did-service.ts
export class ModenaDidPublishRequest extends PublishDIDRequest {
    modenaApiURL!: string;
  }
  
  export class Did extends ModenaRegistryBase<ModenaDidPublishRequest> {
  
    async publishDID(request: ModenaDidPublishRequest): Promise<PublishDIDResponse> {
      const input = {
        recoveryKeys: request.createDIDResponse.recoveryKeys,
        updateKeys: request.createDIDResponse.updateKeys,
        document: request.createDIDResponse.document
      };
  
      const createRequest = ModenaRequest.createCreateRequest(input);
  
      let url = `${request.modenaApiURL}/create`;
      let headers: { [key: string]: string } = {
        "Content-Type": "application/json",
      };
  
      if (request.apiKey && (request.apiKey.type == "queryParam" || !request.apiKey.type)) {
        url = `${url}?${request.apiKey.fieldName || "apikey"}=${request.apiKey.value}`;
      } else if (request.apiKey) {
        headers[request.apiKey.fieldName || "apikey"] = request.apiKey.value;
      };
  
      const options = {
        method: "POST",
        headers,
        body: JSON.stringify(createRequest),
      };
  
      const response = await fetch(url, options);
  
      if (response.status !== 200 && response.status !== 201) {
        const msg = await response.json();
        throw new Error(`DID creation is not ok: ${msg}`);
      }
      const { canonicalId } = ((await response.json()) as any)
        .didDocumentMetadata;
  
      return {
        canonicalId: canonicalId.substring(canonicalId.lastIndexOf(":") + 1),
        did: canonicalId,
        longDid: canonicalId.substring(0, canonicalId.lastIndexOf(":")) + request.createDIDResponse.longDid.replace("did:", ":"),
      };
    }
  
    async updateDID(params: UpdateDIDRequest) {
      const request = await ModenaRequest.createUpdateRequest({
        nextUpdatePublicKeys: params.newUpdateKeys,
        documentMetadata: params.documentMetadata,
        updateKeysToRemove: params.updateKeysToRemove,
        didSuffix: params.didSuffix,
        updatePublicKey: params.updatePublicKey,
        signer: {
          async sign(header: object, content: object): Promise<string> {
            return await params.signer(content);
          }
        },
        idsOfPublicKeysToRemove: params.idsOfVerificationMethodsToRemove,
        idsOfServicesToRemove: params.idsOfServiceToRemove,
        publicKeysToAdd: params.verificationMethodsToAdd?.map(x => ({
          id: x.id,
          publicKeyJwk: x.publicKeyJwk,
          type: x.type,
          purposes: x.purpose.map(y => y.name) as ModenaPublicKeyPurpose[]
        })),
        servicesToAdd: params.servicesToAdd
      });
  
      let url = `${params.updateApiUrl}/create`;
      let headers : { [key: string]: string } = {
        "Content-Type": "application/json",
      };
  
      if (params.apiKey && (params.apiKey.type == "queryParam" || !params.apiKey.type)) {
        url = `${url}?${params.apiKey.fieldName || "apikey"}=${params.apiKey.value}`;
      } else if (params.apiKey) {
        headers[params.apiKey.fieldName || "apikey"] = params.apiKey.value;
      };
  
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      };
  
      const response = await fetch(url, options);
  
      if (response.status !== 200 && response.status !== 201) {
        const msg = await response.json();
        throw new Error(`DID update is not ok: ${msg}`);
      }
    }
  }

// file modena-universal-registry.service.ts

export class ModenaUniversalPublishRequest extends PublishDIDRequest {
    didMethod!: string;
    universalResolverURL!: string;
}

export class ModenaUniversalRegistry extends ModenaRegistryBase<ModenaUniversalPublishRequest> {

    async getSupportedDidMethods(universalRegistryUrl: string): Promise<string[]> {
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        };

        const response = await fetch(`${universalRegistryUrl}/mappings`, options);

        if (response.status !== 200) {
            const msg = await response.json();
            throw new Error("Error getting mapping on node: " + JSON.stringify(msg))
        }

        const body = await response.json();

        return body.list.map((x:{pattern: string;}) => x.pattern) as string[];
    }

    async publishDID(request: ModenaUniversalPublishRequest): Promise<PublishDIDResponse> {
        ModenaSdkConfig.maxCanonicalizedDeltaSizeInBytes = 2000;
        if (!request.universalResolverURL) throw new Error("universalResolverURL is required when did method is defined");

        const input = {
            recoveryKeys: request.createDIDResponse.recoveryKeys,
            updateKeys: request.createDIDResponse.updateKeys,
            document: request.createDIDResponse.document
        };

        const createRequest = ModenaRequest.createCreateRequest(input);

        let url = `${request.universalResolverURL}/create`;
        let headers:{[key:string]: string} = {
            "Content-Type": "application/json",
        };

        if (request.apiKey && (request.apiKey.type == "queryParam" || !request.apiKey.type)) {
            url = `${url}?${request.apiKey.fieldName || "apikey"}=${request.apiKey.value}`;
        } else if (request.apiKey) {
            headers[request.apiKey.fieldName || "apikey"] = request.apiKey.value;
        };

        const options = {
            method: "POST",
            headers,
            body: JSON.stringify({
                modenaRequest: JSON.stringify(createRequest),
                didMethod: request.didMethod
            })
        };

        const response = await fetch(url, options);

        if (response.status !== 200 && response.status !== 201) {
            const msg = await response.json();
            throw new Error(`DID creation is not ok: ${msg}`);
        }
        const { canonicalId } = ((await response.json()) as any)
            .didDocumentMetadata;

        return {
            canonicalId: canonicalId.substring(canonicalId.lastIndexOf(":") + 1),
            did: canonicalId,
            longDid: canonicalId.substring(0, canonicalId.lastIndexOf(":")) + request.createDIDResponse.longDid.replace("did:", ":"),
        };
    }

    async updateDID(params: UpdateDIDRequest) {
        const request = await ModenaRequest.createUpdateRequest({
            nextUpdatePublicKeys: params.newUpdateKeys,
            documentMetadata: params.documentMetadata,
            updateKeysToRemove: params.updateKeysToRemove,
            didSuffix: params.didSuffix,
            updatePublicKey: params.updatePublicKey,
            signer: {
                async sign(header: object, content: object): Promise<string> {
                    return await params.signer(content);
                }
            },
            idsOfPublicKeysToRemove: params.idsOfVerificationMethodsToRemove,
            idsOfServicesToRemove: params.idsOfServiceToRemove,
            publicKeysToAdd: params.verificationMethodsToAdd,
            servicesToAdd: params.servicesToAdd
        });

        let url = `${params.updateApiUrl}/create`;
        let headers: {[key:string]: string} = {
            "Content-Type": "application/json",
        };

        if (params.apiKey && (params.apiKey.type == "queryParam" || !params.apiKey.type)) {
            url = `${url}?${params.apiKey.fieldName || "apikey"}=${params.apiKey.value}`;
        } else if (params.apiKey) {
            headers[params.apiKey.fieldName || "apikey"] = params.apiKey.value;
        };

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        };

        const response = await fetch(url, options);

        if (response.status !== 200 && response.status !== 201) {
            const msg = await response.json();
            throw new Error(`DID update is not ok: ${msg}`);
        }
    }
}

