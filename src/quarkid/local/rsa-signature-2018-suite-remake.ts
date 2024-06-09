import { IVCJsonLDKeyPair, Suite, suiteDecorator } from "@extrimian/kms-core";
// import cryptold from "crypto-ld";

// @ts-ignore
import jsigs from "jsonld-signatures"
/*const jsigs = require('jsonld-signatures'); */

import * as rsa from 'js-crypto-rsa'; // for es6
// const rsa = require('js-crypto-rsa'); // for npm

// var jwkToPem = require('jwk-to-pem');

import { IVCSuite } from "@extrimian/kms-core";
import { AuthenticationPurpose, DIDDocument, Purpose, VerificationMethod } from "@extrimian/did-core";


/* const documentLoaders = require("jsonld"); */
/* const axios = require("axios"); */
import { isArray } from "util";

const { RsaSignature2018 } = jsigs.suites;

// @suiteDecorator(Suite.RsaSignature2018)

/**
 * Esta clase reemplaza al original RsaSignature2018Suite de extrimian (@extrimian/kms-suite-rsa-signature-2018)
 * para evitar llamados a servicios que fallan por CORS
 * 
 * Incluye la clase mencionada y la clase @extrimian/kms-suite-jsonld
 * 
 * Quizás lo que tengamos que hacer aquí es utilizar el axios mock para evitar los llamados a servicios externos.
 */
export class RSASignature2018SuiteRemake  implements IVCSuite{
  // file rsa-signature-2018-suite.ts

  async create(): Promise<IVCJsonLDKeyPair> {
    return new Promise((resolve, rej) => { 
      rsa.generateKey(2048).then((key: { publicKey: any; privateKey: any; }) => {
        // now you get the JWK public and private keys
        const publicKey = key.publicKey;
        const privateKey = key.privateKey;

        resolve({
          publicKeyJWK: publicKey,        
          privateKeyJWK: privateKey,      
          // @ts-ignore
          privateKey: null,
          // @ts-ignore
          publicKey: null,
        })
      });
    })
  }

  protected async getSuite(params?: {
    verificationMethodId: string;   
    controllerDid: string;
  }): Promise<any> {
    if (this.secret && params) {    

      const jwkToPem = (await import('jwk-to-pem')).default //  import * as jwkToPem from 'jwk-to-pem/src/jwk-to-pem.js';

      const key = new jsigs.RSAKeyPair({
        id: params.verificationMethodId,
        controller: params.controllerDid,
        // @ts-ignore
        privateKeyPem: jwkToPem(this.secret.privateKeyJWK, { private: true }),
        // @ts-ignore
        publicKeyPem: jwkToPem(this.secret.publicKeyJWK),
      });

      return new RsaSignature2018({ key });
    }
    else {
      return new RsaSignature2018();  
    }
  }

  // file jsonld-suite.ts
  // @ts-ignore
  protected didDocumentResolver: (did: string) => Promise<DIDDocument>;

  // esto no va más.
  contextDictionary = [
          { key: "https://www.w3.org/2018/credentials/v1", value: "https://storage.googleapis.com/contexts/credentials-v1.json" },
          { key: "https://w3id.org/security/bbs/v1", value: "https://storage.googleapis.com/contexts/vc-di-bbs.json" },
      ];

  // TODO: Optimizar el cache, de tal forma de hacerlo estático.
  private cache = new Map<string, any>();

  private useCache: boolean = true;

  protected secret?: IVCJsonLDKeyPair;

  customDocLoader = async (url: string): Promise<any> => {
      if (url.indexOf('did:') > -1 && url.indexOf("#") > -1) {
          const vm = await this.getVerificationMethod(url);

          if (vm) {
              return {
                  contextUrl: null, // this is for a context via a link header
                  document: this.vmConvertions(vm), // this is the actual document that was loaded
                  documentUrl: url // this is the actual context URL after redirects
              };
          }
      } else if (url.indexOf("did:") > -1) {
          const didDocument = await this.cacheGetter(url, async () => await this.didDocumentResolver(url));

          return {
              contextUrl: null, // this is for a context via a link header
              document: didDocument, // this is the actual document that was loaded
              documentUrl: url // this is the actual context URL after redirects
          };
      } else {
          const response = await this.cacheGetter(url, async () => {
                let contextURL = url // this.contextDictionary.find(x => url.includes(x.key))?.value || url;
                const response = await fetch(contextURL);
                const data = await response.json();
                return data;
                // return response.data;
          });

          return {
              contextUrl: null,
              document: response,
              documentUrl: url
          };
      }
  };

  documentLoader: any = jsigs.extendContextLoader(this.customDocLoader);

  loadSuite(params: {
      secrets: IVCJsonLDKeyPair,
      useCache: boolean,
  }) {
      if (!params.secrets) throw new Error("Secrets are required")
      this.secret = params.secrets;
      this.useCache = params.useCache;
  }

  async sign(documentToSign: any, controllerDid: string, verificationMethodId: string, purpuse: Purpose) {
      const suite = await this.getSuite({
          controllerDid,
          verificationMethodId
      });

      const purpose = await this.getPurpose(purpuse);

      const parsedDocumentToSign = JSON.parse(JSON.stringify(documentToSign));

      const signedDocument = await jsigs.sign(parsedDocumentToSign, {
          suite: suite,
          purpose: purpose,
          documentLoader: this.documentLoader,
      });
      return signedDocument;
  }

  async verify(data: string, purpose: Purpose): Promise<boolean> {
      const suite = await this.getSuite();

      const dataToSign = JSON.parse(data);

      let verifyProof = await jsigs.verify(dataToSign, {
          suite: suite,
          purpose: await this.getPurpose(purpose),
          documentLoader: this.documentLoader
      });

      return verifyProof.verified;
  }

  private async cacheGetter(key: string, action: (key: string) => Promise<any>) {
      if (!this.cache.has(key)) {
          const value = await action(key);
          this.cache.set(key, value);
      }

      return this.cache.get(key);
  }

  private getPurpose(purpose: Purpose) {
      if (purpose.name == "authentication") {
          if ((<AuthenticationPurpose>purpose).challenge) {
              return new jsigs.purposes.AuthenticationProofPurpose({
                  challenge: (<AuthenticationPurpose>purpose).challenge
              });
          }

          throw new Error("Authentication purpose requires challenge. Set this on purpose.challenge field");

      }

      return new jsigs.purposes.ControllerProofPurpose({ term: purpose.name });
  }

  vmConvertions(vm: VerificationMethod): VerificationMethod { return vm; }

  protected async getVerificationMethod<TVerificationMethod extends VerificationMethod = VerificationMethod>
      (vmId: string): Promise<TVerificationMethod> {
      const did = vmId.substring(0, vmId.indexOf("#"));

      const didDocument = await this.cacheGetter(did, async () => await this.didDocumentResolver(did));

      if (!didDocument || !didDocument?.id) throw new Error("DID Document can't be resolved");

      const vm = didDocument.verificationMethod.find(
          (x: any) => x.id.substring(x.id.lastIndexOf("#")) == vmId.substring(vmId.lastIndexOf("#")));

      if (vm) return vm;

      for (const field in didDocument) {
          if (isArray(didDocument[field])) {
              for (const vm in didDocument[field]) {
                  // @ts-ignore
                  if (didDocument[field][vm].id == vmId) {
                      // @ts-ignore
                      return didDocument[field][vm];
                  }
              }
          }
      }

      throw new Error("Verification method not found: " + vmId);
  }
}
