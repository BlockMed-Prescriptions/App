import Profile from '../model/Profile';
import Receta from '../model/Receta';
import CredentialSend from '../quarkid/CredentialSender';
import ProfileService from './ProfileService';

import { VerifiableCredential, VerifiableCredentialService } from "@quarkid/vc-core";

/**
 * Esta clase se encarga de construir una receta.
 */

class RecetaService {
    private static instance: RecetaService;
    private vcService: VerifiableCredentialService

    public static getInstance(): RecetaService {
        if (!RecetaService.instance) {
            RecetaService.instance = new RecetaService(
                new VerifiableCredentialService()
            );
        }
        return RecetaService.instance;
    }

    private constructor(vcService: VerifiableCredentialService) {
        this.vcService = vcService
    }
    
    public buildReceta(
        didMedico: string,
        didPaciente: string,
        nombrePaciente: string,
        medicamentos: string[],
        indicaciones: string
    ) : Receta {
        const fechaEmision = new Date();
        const fechaVencimiento = new Date()
        // la fecha de vencimiento es de 30 días
        fechaVencimiento.setDate(fechaEmision.getDate() + 30);
        const receta: Receta = {
            didMedico: didMedico,
            didPaciente: didPaciente,
            nombrePaciente: nombrePaciente,
            medicamentos: medicamentos,
            indicaciones: indicaciones,
            fechaEmision: fechaEmision,
            fechaVencimiento: fechaVencimiento
        };

        receta.id = this.buildRandomId(receta);

        return receta;
    }

    public async generateCertificate(receta: Receta) : Promise<VerifiableCredential> {
        const credential = await this.vcService.createCredential({
            context: [
                "https://w3id.org/security/v2",
                "https://w3id.org/security/bbs/v1",
            ],
            vcInfo: {
                issuer: receta.didMedico,
                issuanceDate: receta.fechaEmision,
                expirationDate: receta.fechaVencimiento,
                id: receta.id!,
                types: ["RecetaCertificate"],
            },
            data: {
                type: "Receta",
                // indicaciones: receta.indicaciones,
                "schema:MedicalGuideline": {
                    "schema:guideline": receta.indicaciones,
                    "schema:guidelineDate": receta.fechaEmision.toISOString(),

                },
                // didPaciente: receta.didPaciente,
                // nombrePaciente: receta.nombrePaciente,
                "shema:Patient": {
                    "schema:name": receta.nombrePaciente,
                    "schema:identifier": receta.didPaciente,
                },
                // medicamentos: receta.medicamentos,
                "schema:Drug": {
                    "schema:name": receta.medicamentos.join(", ")
                }
                // fechaEmision: receta.fechaEmision,
                // fechaVencimiento: receta.fechaVencimiento,
            },
            mappingRules: null,
        })

        return credential;
    }

    public buildRecetaFromCredential(credential: VerifiableCredential) : Receta {
        const receta: Receta = {
            didMedico: 'string' === typeof credential.issuer ? credential.issuer : credential.issuer.id,
            didPaciente: credential.credentialSubject["shema:Patient"]["schema:identifier"],
            nombrePaciente: credential.credentialSubject["shema:Patient"]["schema:name"],
            medicamentos: credential.credentialSubject["schema:Drug"]["schema:name"].split(", "),
            indicaciones: credential.credentialSubject["schema:MedicalGuideline"]["schema:guideline"],
            fechaEmision: credential.issuanceDate,
            fechaVencimiento: credential.expirationDate!,
            id: credential.id
        }

        return receta;   
    }

    public async sendReceta(profile: Profile, receta: Receta, targetDID?: string) : Promise<void> {
        const target = targetDID || receta.didPaciente;
        CredentialSend(profile, target, receta.certificado!)
    }

    private buildRandomId(receta: Receta) : string {
        // uso los datos de receta para generar un id único
        let data = receta.didMedico + receta.didPaciente + receta.fechaEmision.toISOString();
        // convierto el string a un número
        let hash = (Math.random() * 100000000000)
        for (let i = 0; i < data.length; i++) {
            let char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        let first = Math.abs(hash * 707).toString(36)

        let second = Math.abs(hash * Math.random() * 1000).toString(16).substring(2, 18)

        return first + "-" + second;
    }


}

export default RecetaService;
