import {
  documentOutline,
  medkitOutline,
  paperPlaneOutline,
  peopleOutline,
  settingsOutline,
} from "ionicons/icons";
import {
  //   RECETA_FOLDER_ARCHIVED,
  //   RECETA_FOLDER_FAVORITOS,
  RECETA_FOLDER_INBOX,
  RECETA_FOLDER_OUTBOX,
  RECETA_FOLDER_PAPELERA,
  RecetaFolder,
} from "../service/RecetaBcData";

export interface AppPage {
  id: string;
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
  pathname: string;
  pageTitle?: string;
  folder: RecetaFolder;
  count?: number;
  roles: string[];
}

export const appPagesInit: AppPage[] = [
  {
    id: "inbox",
    title: "Mis recetas",
    // url: "/folder/Inbox",
    url: "/receipts?type=my",
    pathname: "/receipts",
    iosIcon: documentOutline,
    mdIcon: documentOutline,
    folder: RECETA_FOLDER_INBOX,
    roles: ["pac"],
  },
  {
    id: "recibidas",
    title: "Recetas pendientes",
    // url: "/folder/Recibidas",
    url: "/receipts?type=pending",
    pathname: "/receipts",
    iosIcon: documentOutline,
    mdIcon: documentOutline,
    folder: RECETA_FOLDER_INBOX,
    roles: ["far"],
  },
  {
    id: "emitidas",
    title: "Recetas Emitidas",
    // url: "/folder/Emitidas",
    url: "/receipts?type=emit",
    pathname: "/receipts",
    iosIcon: documentOutline,
    mdIcon: documentOutline,
    folder: RECETA_FOLDER_OUTBOX,
    roles: ["med"],
  },
  {
    id: "pacientes",
    title: "Pacientes",
    url: "/pacientes",
    pathname: "/pacientes",
    iosIcon: peopleOutline,
    mdIcon: peopleOutline,
    roles: ["med"],
    folder: RECETA_FOLDER_INBOX,
  },
  {
    id: "outbox",
    title: "Recetas Enviadas",
    // url: "/folder/Outbox",
    url: "/receipts?type=sent",
    pathname: "/receipts",
    iosIcon: paperPlaneOutline,
    mdIcon: paperPlaneOutline,
    folder: RECETA_FOLDER_OUTBOX,
    roles: ["pac"],
  },
  {
    id: "dispensas",
    title: "Dispensas realizadas",
    pageTitle: "Dispensas realizadas",
    // url: "/folder/Dispensas",
    url: "/receipts?type=dispens_made",
    pathname: "/receipts",
    iosIcon: medkitOutline,
    mdIcon: medkitOutline,
    folder: RECETA_FOLDER_OUTBOX,
    roles: ["far"],
  },
  {
    id: "settings",
    title: "Ajustes",
    url: "/folder/settings",
    pathname: "/folder/settings",
    iosIcon: settingsOutline,
    mdIcon: settingsOutline,
    folder: RECETA_FOLDER_PAPELERA,
    roles: ["pac", "med", "far"],
  },
  //   {
  //     id: "favorites",
  //     title: "Recetas Favoritas",
  //     url: "/folder/Favorites",
  //     iosIcon: heartOutline,
  //     mdIcon: heartSharp,
  //     folder: RECETA_FOLDER_FAVORITOS,
  //     roles: ["med", "far", "pac"],
  //   },
  //   {
  //     id: "archived",
  //     title: "Archivadas",
  //     pageTitle: "Recetas archivadas",
  //     url: "/folder/Archived",
  //     iosIcon: archiveOutline,
  //     mdIcon: archiveSharp,
  //     folder: RECETA_FOLDER_ARCHIVED,
  //     roles: ["med", "far", "pac"],
  //   },
  //   {
  //     id: "trash",
  //     title: "Papelera",
  //     url: "/folder/Trash",
  //     iosIcon: trashOutline,
  //     mdIcon: trashSharp,
  //     folder: RECETA_FOLDER_PAPELERA,
  //     roles: ["med", "far", "pac"],
  //   },
];

const getAppPage = (id: string, rol?: string): AppPage => {
  if ("default" === id) {
    let pp = appPagesInit.find((p) => p.roles.includes(rol || "pac"));
    if (pp) return pp;
  } else {
    const app = appPagesInit.filter(
      (p) => p.id.toLowerCase() === id.toLowerCase()
    );
    if (app.length === 1) return app[0];
  }
  throw new Error("AppPage " + id + " not found");
};

export default getAppPage;
