import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent } from "@ionic/react";
import React from "react";
//import React from "react";
import { useImperativeHandle, useRef } from "react";

export type HTMLModalCertificado = {
    open: () => void,
    dismiss: () => void
}

interface ContainerProps {
    certificado: any
    title?: string
}

const ModalCertificado: React.ForwardRefRenderFunction<HTMLModalCertificado, ContainerProps> = (props, forwardedRef) => {

    const modal = useRef<HTMLIonModalElement>(null);

    const dismiss = () => {
        modal.current!.dismiss();
    }

    useImperativeHandle(forwardedRef, () => ({
        open() {
            modal.current!.present();
        },
        dismiss() {
            dismiss();
        },
    }));

    return (
        <IonModal ref={modal}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{props.title ? props.title : "Certificado"}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => dismiss()}>Cerrar</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <pre style={{"fontSize": "80%"}}>{JSON.stringify(props.certificado, null, 2)}</pre>
            </IonContent>
        </IonModal>
    );
};

export default React.forwardRef(ModalCertificado);

