/**
 * Esta funcion se encarga de generar una receta y de realizar todos los pasos, esto es
 *
 * - Crear la receta a partir de sus parámetros
 * - Generar el certificado de la receta
 * - Validar el certificado
 * - Enviar la receta al paciente
 */

import Profile from "../model/Profile";
import RecetaService from "./RecetaService";
import { CredentialSigner } from "../quarkid/CredentialSigner";
import { CredentialVerifier } from "../quarkid/CredentialVerifier";
import RecetaBcData, { RECETA_FOLDER_OUTBOX } from "../service/RecetaBcData";
import Receta from "../model/Receta";
import MessageSender from "../message/MessageSender";
import BlockchainPublisher from "./BlockchainPublisher";
import TransaccionGenerator from "./TransaccionGenerator";
import Transaccion from "../model/Transaccion";
import { closeOutline } from "ionicons/icons";

const recetaService: RecetaService = RecetaService.getInstance();
const data: RecetaBcData = RecetaBcData.getInstance();
const publisher: BlockchainPublisher = BlockchainPublisher.getInstance();

export const RecetaGenerator = async (
  profile: Profile,
  didPaciente: string,
  nombrePaciente: string,
  medicamentos: string[],
  indicaciones: string,
  didFinanciador: string | null,
  credencial: string | null,
  presentToast: (opts: any) => Promise<void>,
  dismissToast: () => Promise<void>
): Promise<Receta> => {
  let receta = recetaService.buildReceta(
    profile.didId!,
    didPaciente,
    nombrePaciente,
    medicamentos,
    indicaciones,
    didFinanciador,
    credencial
  );

  console.log("Receta", receta);

  await presentToast({
    message: "Generando la receta ...",
    position: "top",
    color: "primary",
    cssClass: "toast",
    buttons: [
      {
        icon: closeOutline,
        handler: () => {
          dismissToast();
        },
      },
    ],
  });

  let certificado;
  try {
    certificado = await recetaService.generateCertificate(receta, profile);
    console.log("Certificado", certificado);
    await dismissToast();
  } catch (e) {
    await dismissToast();
    throw e;
  }

  await presentToast({
    message: "Firmando la receta ...",
    position: "top",
    color: "primary",
    cssClass: "toast",
    buttons: [
      {
        icon: closeOutline,
        handler: () => {
          dismissToast();
        },
      },
    ],
  });

  let vc;
  try {
    vc = await CredentialSigner(certificado, profile);
    receta.certificado = vc;
    dismissToast();
  } catch (e) {
    await dismissToast();
    throw e;
  }

  await presentToast({
    message: "Certificado firmado, procedemos a verificar ...",
    position: "top",
    color: "primary",
    cssClass: "toast",
    buttons: [
      {
        icon: closeOutline,
        handler: () => {
          dismissToast();
        },
      },
    ],
  });

  let verifyResult;
  try {
    verifyResult = await CredentialVerifier(receta.certificado, profile);
    await dismissToast();
  } catch (e) {
    await dismissToast();
    throw e;
  }

  if (!verifyResult || !verifyResult.result) {
    console.error(
      "Certificado firmado pero no verificado. Error: ",
      verifyResult
    );
    dismissToast();
    throw new Error(
      "Certificado firmado pero no verificado. Error: " +
        verifyResult.error?.description
    );
  }

  // Registrando receta en la blockchain
  await presentToast({
    message: "Registrando receta en la blockchain ...",
    position: "top",
    color: "primary",
    cssClass: "toast",
    buttons: [
      {
        icon: closeOutline,
        handler: () => {
          dismissToast();
        },
      },
    ],
  });
  try {
    receta.transactionHashEmision = await publisher.emitir(receta);
    await dismissToast();
  } catch (e) {
    await dismissToast();
    throw e;
  }

  let transaccion: Transaccion;
  try {
    transaccion = await TransaccionGenerator(
      profile,
      receta.id!,
      receta.transactionHashEmision,
      "emision"
    );
    receta.transacciones.push(transaccion);
  } catch (e) {
    console.error("Error firmando transacción de emisión.", e);
    throw e;
  }

  // Guardo la receta en la persistencia local
  await data.saveReceta(receta, RECETA_FOLDER_OUTBOX);

  try {
    await presentToast({
      message: "Enviando receta al paciente ...",
      position: "top",
      color: "primary",
      cssClass: "toast",
      buttons: [
        {
          icon: closeOutline,
          handler: () => {
            dismissToast();
          },
        },
      ],
    });
    await recetaService.sendReceta(
      profile,
      receta,
      didPaciente,
      "emision-receta"
    );
  } catch (e) {
    console.error("Error enviando la receta al paciente", e);
    await dismissToast();
    throw e;
  }

  await dismissToast();

  return receta;
};
