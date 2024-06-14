import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon, useIonAlert } from "@ionic/react";
import Receta from "../model/Receta";
import { archive, heart, send, trash } from "ionicons/icons";


interface ContainerProps {
    receta: Receta;
    onClickSend?: () => void;
}

const RecetaCard: React.FC<ContainerProps> = ({ receta, onClickSend }) => {

    const [presentAlert] = useIonAlert();
    const fechaEmision = new Date(receta.fechaEmision)

    const notImplementedAlert = () => {
        presentAlert({
            header: "No implementado aún ...",
            message: "Esta funcionalidad aún no está implementada, pronto ya lo tendremos.",
            buttons: [
                'Ok'
            ]
        })
    }

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
                <IonButton size="small" onClick={() => notImplementedAlert()}>
                    <IonIcon slot="icon-only" icon={heart} />
                </IonButton>
                <IonButton size="small" onClick={() => notImplementedAlert()}>
                    <IonIcon slot="icon-only" icon={archive} />
                </IonButton>
                {onClickSend ? (
                <IonButton size="small" color="secondary" onClick={() => onClickSend()}>
                    <IonIcon slot="icon-only" icon={send} />
                </IonButton>
                ) : null}
                <IonButton fill="outline" color="danger"  size="small" onClick={
                    () => notImplementedAlert()
                }>
                    <IonIcon slot="icon-only" icon={trash} />
                </IonButton>
            </div>
        
        </IonCard>
    )
}

export default RecetaCard;
