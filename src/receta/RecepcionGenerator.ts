import Profile from "../model/Profile";
import Recepcion from "../model/Recepcion";
import Receta from "../model/Receta";
import { CredentialSigner } from "../quarkid/CredentialSigner";
import MessageSender from "../message/MessageSender";
import RecetaBcData from "../service/RecetaBcData";
import BlockchainPublisher from "./BlockchainPublisher";
import TransaccionGenerator from "./TransaccionGenerator";
import CredencialBuilder from "../quarkid/CredentialBuilder";
import { checkmarkCircleOutline, closeCircleOutline } from "ionicons/icons";

const data = RecetaBcData.getInstance();
const publisher = BlockchainPublisher.getInstance();

export const RecepcionGenerator = async (
  profile: Profile,
  receta: Receta,
  onProgress?: (
    msg: string,
    type: "success" | "info" | "error",
    button?: boolean,
    icon?: string,
    duration?: number
  ) => void,
  callback?: () => void
): Promise<Recepcion> => {
  const fechaRecepcion = new Date();

  onProgress &&
    onProgress(
      "Generando certificado de recepción",
      "success",
      false,
      undefined,
      2000
    );
  const credential = await CredencialBuilder({
    context: [
      "https://w3id.org/security/v2",
      "https://w3id.org/security/bbs/v1",
    ],
    vcInfo: {
      issuer: profile.didId!,
      issuanceDate: fechaRecepcion,
      expirationDate: new Date(
        fechaRecepcion.getFullYear() + 5,
        fechaRecepcion.getMonth(),
        fechaRecepcion.getDate()
      ),
      id: receta.id!,
      types: ["RecepcionCertificate"],
    },
    data: {
      type: "Recepcion",
      "schema:Date": fechaRecepcion.toISOString(),
      "schema:identifier": receta.id!,
    },
  });

  const recepcion: Recepcion = {
    recetaId: receta.id!,
    fechaRecepcion: fechaRecepcion,
    certificado: credential,
  };

  let vc;
  try {
    onProgress &&
      onProgress(
        "Firmando certificado de recepción.",
        "info",
        false,
        undefined,
        2000
      );
    vc = await CredentialSigner(credential, profile);
  } catch (e) {
    onProgress &&
      onProgress("Error firmando certificado de recepción", "error");
    throw e;
  }

  onProgress &&
    onProgress(
      "Enviando confirmación de recepción.",
      "info",
      false,
      undefined,
      2000
    );
  await MessageSender(
    profile,
    receta.dispensa!.didFarmacia,
    "confirmacion-dispensa",
    recepcion.certificado
  );

  if (receta.didFinanciador && recepcion.certificado) {
    await MessageSender(
      profile,
      receta.didFinanciador,
      "confirmacion-dispensa",
      recepcion.certificado
    );
  }

  receta.recepcion = recepcion;
  receta.estado = "consumida";
  receta.consumida = true;
  await data.saveReceta(receta);

  onProgress &&
    onProgress(
      "Registrando recepción en blockchain.",
      "info",
      false,
      undefined,
      2000
    );
  let hashTransaccion: string;
  try {
    hashTransaccion = await publisher.dispensar(receta, callback);
  } catch (e) {
    if (callback) callback();
    onProgress &&
      onProgress("Error registrando recepción en blockchain.", "error", true);
    throw e;
  }

  try {
    const transaccion = await TransaccionGenerator(
      profile,
      receta.id!,
      hashTransaccion,
      "dispensa",
      onProgress
    );
    await data.addTransaccionToReceta(receta, transaccion);
    await MessageSender(
      profile,
      receta.dispensa!.didFarmacia,
      "informar-transaccion",
      transaccion.certificado!
    );
  } catch (e) {
    onProgress &&
      onProgress(
        "Error firmando transacción de recepción.",
        "error",
        true,
        closeCircleOutline
      );
    throw e;
  }

  onProgress &&
    onProgress("Recepción enviada.", "success", true, checkmarkCircleOutline);
  return recepcion;
};

export default RecepcionGenerator;
