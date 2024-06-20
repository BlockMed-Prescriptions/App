import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon, useIonAlert } from "@ionic/react";
import Receta from "../model/Receta";
import { archive, heart, heartOutline, send, trash } from "ionicons/icons";
import RecetaBcData, { RECETA_FOLDER_FAVORITOS } from "../service/RecetaBcData";
import { useEffect, useState } from "react";
import { useHistory } from "react-router";


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
    const history = useHistory()

    useEffect(() => {
        if (!receta) return
        if ('undefined' === typeof receta.enCarpetaFavoritos) {
            data.getRecetasFromFolder(RECETA_FOLDER_FAVORITOS).then((recetas) => {
                if (recetas.find((r) => r.id === receta.id)) {
                    setEnCarpetaFavoritos(true)
                    receta.enCarpetaFavoritos = true
                } else {
                    setEnCarpetaFavoritos(false)
                    receta.enCarpetaFavoritos = false
                }
            })
        } else {
            setEnCarpetaFavoritos(receta.enCarpetaFavoritos!)
        }
    })

    const click = () => {
        history.push(`/receta/${receta.id}`)
    }

    const favoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        onClickFavorite!()
    }

    const sendClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        onClickSend!()
    }

    const trashClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        onClickTrash!()
    }

    const archiveClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        onClickArchive!()
    }

    return (
        <IonCard button={true} onClick={() => click()}>
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
                <IonButton size="small" onClick={(e) => { favoriteClick(e) }} color={enCarpetaFavoritos ? "primary" : "light"}>
                    <IonIcon slot="icon-only" icon={enCarpetaFavoritos ? heart : heartOutline} />
                </IonButton>
                ) : null}
                {onClickArchive ? (
                <IonButton size="small" onClick={(e) => archiveClick(e)}>
                    <IonIcon slot="icon-only" icon={archive} />
                </IonButton>
                ) : null}
                {onClickSend ? (
                <IonButton size="small" color="secondary" onClick={(e) => sendClick(e)}>
                    <IonIcon slot="icon-only" icon={send} />
                </IonButton>
                ) : null}
                {onClickTrash ? (
                <IonButton fill="outline" color="danger"  size="small" onClick={(e) => trashClick(e)}>
                    <IonIcon slot="icon-only" icon={trash} />
                </IonButton>
                ) : null}
            </div>
        </IonCard>
        
    )
}

export default RecetaCard;
