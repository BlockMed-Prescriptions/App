
import { ModenaUniversalRegistry } from "@quarkid/did-registry";
import { IJWK, LANG, Suite } from "@quarkid/kms-core"
import { AssertionMethodPurpose, KeyAgreementPurpose } from "@quarkid/did-core";


import { config as quarkidConfig } from "./config";

/**
 * Esta función crea un DID en la red de QuarkID y devuelve el id del DID Creado.
 */
export const DIDBuilder = async (updateKey: IJWK, recoveryKey: IJWK, didComm: IJWK, bbsbls: IJWK) : Promise<string> => {
    const registry = new ModenaUniversalRegistry();

    const service = {
        id: 'dwn-default',
        type: 'DecentralizedWebNode',
        serviceEndpoint: {
            nodes: [quarkidConfig.serviceEndpoint]
        }
    };

    const createDidResponse = await registry.createDID({
        updateKeys: [updateKey],
        recoveryKeys: [recoveryKey],
        verificationMethods: [
          {
            id: "bbsbls",
            type: "Bls12381G1Key2020",
            publicKeyJwk: bbsbls,
            purpose: [new AssertionMethodPurpose()],
          },
          {
            id: "didComm",
            type: "X25519KeyAgreementKey2019",
            publicKeyJwk: didComm,
            purpose: [new KeyAgreementPurpose()],
          },
        ],
        services: [service],
    });

    const result = await registry.publishDID({
        universalResolverURL: quarkidConfig.proxyEndpoint,
        didMethod: quarkidConfig.didMethod,
        createDIDResponse: createDidResponse,
    });

    return result.did;
}


