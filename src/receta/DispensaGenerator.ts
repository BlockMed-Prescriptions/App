import Dispensa from "../model/Dispensa";
import Profile from "../model/Profile";
import { CredentialSigner } from "../quarkid/CredentialSigner";
import MessageSender from "../message/MessageSender";
import Receta from "../model/Receta";
import RecetaBcData, {
  RECETA_FOLDER_INBOX,
  RECETA_FOLDER_OUTBOX,
} from "../service/RecetaBcData";
import CredencialBuilder from "../quarkid/CredentialBuilder";
import { checkmarkCircleOutline } from "ionicons/icons";

const data = RecetaBcData.getInstance();

const generateCertificate = async (dispensa: Dispensa) => {
  const medicamentos = dispensa.medicamentos.map((m) => {
    return { "schema:name": m };
  });
  const lotes = dispensa.lotes.map((l) => {
    return { "schema:batchNumber": l };
  });
  const credential = await CredencialBuilder({
    context: [
      "https://w3id.org/security/v2",
      "https://w3id.org/security/bbs/v1",
    ],
    vcInfo: {
      issuer: dispensa.didFarmacia,
      issuanceDate: dispensa.fechaDispensa,
      expirationDate: new Date(
        dispensa.fechaDispensa.getFullYear() + 5,
        dispensa.fechaDispensa.getMonth(),
        dispensa.fechaDispensa.getDate()
      ),
      id: dispensa.recetaId,
      types: ["DispensaCertificate"],
    },
    data: {
      type: "Dispensa",
      // indicaciones: receta.indicaciones,
      "schema:Drug": medicamentos,
      "schema:DrugBatch": lotes,
      "schema:Date": dispensa.confirmacionDispensa
        ? dispensa.confirmacionDispensa.toISOString()
        : null,
      "schema:identifier": dispensa.recetaId,
    },
  });

  return credential;
};

export const DispensaGenerator = async (
  profile: Profile,
  receta: Receta,
  medicamentos: string[],
  lotes: string[],
  presentToast: (opts: any) => Promise<void>,
  dismissToast: () => Promise<void>
): Promise<Dispensa> => {
  const dispensa: Dispensa = {
    didFarmacia: profile.didId!,
    recetaId: receta.id!,
    fechaDispensa: new Date(),
    medicamentos: medicamentos,
    lotes: lotes,
    confirmacionDispensa: null,
  };

  const certificado = await generateCertificate(dispensa);

  await presentToast({
    message: "Firmando acción ...",
    position: "top",
    color: "warning",
    cssClass: "toast",
  });

  let vc;
  try {
    vc = await CredentialSigner(certificado, profile);
    dispensa.certificado = vc;
    dismissToast();
  } catch (e) {
    console.log("Error credential signer", e);
    await dismissToast();
    throw e;
  }

  console.log("Dispensa", dispensa, certificado, vc);
  try {
    await presentToast({
      message: "Enviando dispensa al paciente ...",
      position: "top",
      color: "success",
      cssClass: "toast",
    });
    await MessageSender(
      profile,
      receta.didPaciente,
      "solicitud-confirmacion-dispensa",
      dispensa.certificado
    );

    if (receta.didFinanciador && dispensa) {
      await MessageSender(
        profile,
        receta.didFinanciador,
        "solicitud-confirmacion-dispensa",
        dispensa.certificado
      );
    }
  
  } catch (e) {
    console.error("Error enviando la dispensa al paciente", e);
    await dismissToast();
    throw e;
  }

  await dismissToast();

  receta.estado = "pendiente-confirmacion-dispensa";
  receta.dispensa = dispensa;
  await data.saveReceta(receta);
  await data.moveRecetaToFolder(
    receta,
    RECETA_FOLDER_INBOX,
    RECETA_FOLDER_OUTBOX
  );

  await presentToast({
    message: "La receta se ha dispensado correctamente",
    position: "top",
    color: "success",
    cssClass: "toast",
    icon: checkmarkCircleOutline,
    buttons: [
      {
        text: "Aceptar",
        handler: () => {
          dismissToast();
        },
      },
    ],
  });

  return dispensa;
};
