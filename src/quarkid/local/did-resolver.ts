import { DIDDocument, DIDDocumentMetadata } from "@extrimian/did-core";
import axios from "axios";

// file modena-response.ts

export class ModenaResponse {
    "@context": string;
    didDocument!: DIDDocument;
    didDocumentMetadata!: DIDDocumentMetadata;
}

// file universal-resolver.ts

export class DIDUniversalResolver {
    url!: string;
    apiKey?: {
        fieldName?: string,
        value: string,
        type?: "header" | "queryParam"
    };

    constructor(private config: {
        universalResolverURL: string,
        apiKey?: {
            fieldName?: string,
            value: string,
            type?: "header" | "queryParam"
        }
    }) {
        if (config.apiKey) {
            config.apiKey.fieldName = config.apiKey.fieldName || "apikey";
            config.apiKey.type = config.apiKey.type || "queryParam";
        }

        this.apiKey = config.apiKey;
    }

    async resolveDID(did: string): Promise<DIDDocument|null> {
        let headers: any = {};
        let url = `${this.config.universalResolverURL}/resolve/${did}`;

        if (this.apiKey?.type == "queryParam") {
            url = `${url}?${this.apiKey.fieldName}=${this.apiKey.value}`;
        } else if (this.apiKey?.fieldName && this.apiKey?.type == "header") {
            headers = {
                [this.apiKey.fieldName]: this.apiKey.value
            };
        }

        const result = await axios.get(url, {
            headers: headers
        });


        if (typeof result.data === "string" && result.data.toLocaleLowerCase() == "did not found") {
            return null;
        }

        return result.data;
    }

    async resolveDIDWithMetadata(did: string): Promise<ModenaResponse|null> {
        let headers;
        let url = `${this.config.universalResolverURL}/1.0/identifiers/${did}`;

        if (this.apiKey?.type == "queryParam") {
            url = `${url}?${this.apiKey.fieldName}=${this.apiKey.value}`;
        } else if (this.apiKey?.fieldName && this.apiKey?.type == "header") {
            headers = {
                [this.apiKey.fieldName]: this.apiKey.value
            };
        }

        const result = await axios.get(url, {
            headers: headers
        });


        if (typeof result.data === "string" && result.data.toLocaleLowerCase() == "did not found") {
            return null;
        }

        return result.data;
    }
}