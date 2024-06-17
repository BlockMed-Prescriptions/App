import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon, useIonAlert } from "@ionic/react";
import Receta from "../model/Receta";
import { archive, heart, heartOutline, send, trash } from "ionicons/icons";
import RecetaBcData, { RECETA_FOLDER_FAVORITOS } from "../service/RecetaBcData";
import { useEffect, useState } from "react";


interface ContainerProps {
    receta: Receta;
    onClickSend?: () => void;
    onClickArchive?: () => void;
    onClickFavorite?: () => void;
    onClickTrash?: () => void;
}

const RecetaCard: React.FC<ContainerProps> = ({ receta, onClickSend, onClickArchive, onClickFavorite, onClickTrash }) => {

    const [presentAlert] = useIonAlert();
    const [enCarpetaFavoritos, setEnCarpetaFavoritos] = useState(false)
    const fechaEmision = new Date(receta.fechaEmision)
    const data = RecetaBcData.getInstance()

    const notImplementedAlert = () => {
        presentAlert({
            header: "No implementado aún ...",
            message: "Esta funcionalidad aún no está implementada, pronto ya lo tendremos.",
            buttons: [
                'Ok'
            ]
        })
    }

    useEffect(() => {
        if (!receta) return
        console.log("Receta", receta.enCarpetaFavoritos, receta.id)
        if ('undefined' === typeof receta.enCarpetaFavoritos) {
            data.getRecetasFromFolder(RECETA_FOLDER_FAVORITOS).then((recetas) => {
                if (recetas.find((r) => r.id === receta.id)) {
                    console.log(receta.nombrePaciente, "en favoritos true")
                    setEnCarpetaFavoritos(true)
                    receta.enCarpetaFavoritos = true
                } else {
                    console.log(receta.nombrePaciente, "en favoritos false")
                    setEnCarpetaFavoritos(false)
                    receta.enCarpetaFavoritos = false
                }
            })
        } else {
            setEnCarpetaFavoritos(receta.enCarpetaFavoritos!)
        }
    })

    return (
        <IonCard button={true}>
            <IonCardHeader>
                <IonCardTitle>{receta.nombrePaciente}</IonCardTitle>
                <IonCardSubtitle>
                    {fechaEmision.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
                <ul>
                    {receta.medicamentos.map((medicamento, index) => (
                        <li key={index}>{medicamento}</li>
                    ))}
                </ul>
            </IonCardContent>

            <div className="ion-float-end">
                {onClickFavorite ? (
                <IonButton size="small" onClick={() => onClickFavorite()} color={enCarpetaFavoritos ? "primary" : "light"}>
                    <IonIcon slot="icon-only" icon={enCarpetaFavoritos ? heart : heartOutline} />
                </IonButton>
                ) : null}
                {onClickArchive ? (
                <IonButton size="small" onClick={() => onClickArchive()}>
                    <IonIcon slot="icon-only" icon={archive} />
                </IonButton>
                ) : null}
                {onClickSend ? (
                <IonButton size="small" color="secondary" onClick={() => onClickSend()}>
                    <IonIcon slot="icon-only" icon={send} />
                </IonButton>
                ) : null}
                {onClickTrash ? (
                <IonButton fill="outline" color="danger"  size="small" onClick={() => onClickTrash()}>
                    <IonIcon slot="icon-only" icon={trash} />
                </IonButton>
                ) : null}
            </div>
        
        </IonCard>
    )
}

export default RecetaCard;
