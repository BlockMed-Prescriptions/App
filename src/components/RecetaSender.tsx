

import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import Receta from '../model/Receta';
import RecetaService from '../receta/RecetaService';
import RecetaBcData, { RECETA_FOLDER_INBOX, RECETA_FOLDER_OUTBOX } from '../service/RecetaBcData';
import ProfileHandler from '../service/ProfileHandler';
import { IonAlert, useIonActionSheet, useIonToast } from '@ionic/react';
import ModalScanner, { HTMLModalScanner } from './ModalScanner';
import { qrCode, close, keypad } from 'ionicons/icons';
import { DIDResolver } from '../quarkid/DIDResolver';
import { useCurrentProfile } from '../hooks';

interface ContainerProps {
    callback?: () => void
}

export type HTMLRecetaSender = {
    send: (receta: Receta) => void,
    solicitudConfirmacion(receta: Receta): void
}

const RecetaSender: React.ForwardRefRenderFunction<HTMLRecetaSender, ContainerProps> = (props, forwardedRef) => {
    const [receipt, setReceipt] = useState<Receta | null>(null);
    const { currentProfile } = useCurrentProfile();
    const [presentToast] = useIonToast();
    const [presentActionSheet] = useIonActionSheet();

    const recetaService = RecetaService.getInstance()
    const data = RecetaBcData.getInstance()
    const modalScanner = useRef<HTMLModalScanner>(null);
    const promptDid = useRef<HTMLIonAlertElement>(null);

    const sendReceta = async (targetDid: string, receta: Receta) => {
        recetaService.sendReceta(currentProfile!, receipt!, targetDid, 'envio-farmacia')
        receipt!.estado = 'enviada-farmacia'
        await data.saveReceta(receipt!)
        await data.moveRecetaToFolder(receta, RECETA_FOLDER_INBOX, RECETA_FOLDER_OUTBOX)
        if (props.callback) props.callback()
    }

    const [isScanOpen, setIsScanOpen] = useState<boolean>(false);

    // let recetaCallback: Receta | null = null;

    const scanCallback = (scanned: string) => {
        if (!receipt) {
            console.error("No hay receipt")
            return
        }
        modalScanner.current?.dismiss().then(() => {
            const profileTarget = ProfileHandler.fromQrCode(scanned)
            if (profileTarget) {
                if (!ProfileHandler.isFarmacia(profileTarget)) {
                    presentToast({
                        message: "El código QR no corresponde a una farmacia.",
                        color: "danger",
                        cssClass: "toast",
                        duration: 2000,
                        position: "top"
                    })
                } else {
                    presentToast({
                        message: "Enviando receta a la farmacia.",
                        cssClass: "toast",
                        color: "success",
                        duration: 2000,
                        position: "top"
                    })
                    sendReceta(profileTarget.didId!, receipt!)
                }
                setIsScanOpen(false);
            }
        })
    }

    const promptDidCallback = (did: string) => {
        if (did) {
            console.log("Prompt DID", did, receipt)
            DIDResolver(did).then((doc) => {
                presentToast({
                    message: "Enviando receta a la farmacia.",
                    color: "success",
                    cssClass: "toast",
                    duration: 2000,
                    position: "top"
                })
                sendReceta(did, receipt!)
            }).catch((e) => {
                presentToast({
                    message: "Revise el ID de farmacia ... No se pudo enviar la receta.",
                    color: "danger",
                    cssClass: "toast",
                    duration: 2000,
                    position: "top"
                })
            })
        }
    }

    const envioRecetaProfilePaciente = (receta: Receta) => {
        // recetaService.sendReceta(currentProfile, receta)
        console.log("Enviando receta como paciente", receta)
        presentActionSheet({
            buttons: [
                {
                    text: "Scanear QR",
                    icon: qrCode,
                    handler: () => {
                        setReceipt(receta)
                        // recetaCallback = receta;
                        // modalScanner.current?.open()
                        setIsScanOpen(true);
                    }
                },
                {
                    text: "Ingresar código manualmente",
                    icon: keypad,
                    handler: () => {
                        setReceipt(receta)
                        console.log("Ingresar código manualmente")
                        // recetaCallback = receta;
                        promptDid.current?.present()
                    }
                },
                {
                    text: "Cancelar",
                    icon: close,
                    role: "cancel"
                },
            ]
        })
    }

    const envioRecetaProfileMedico = (receta: Receta) => {
        recetaService.sendReceta(currentProfile!, receta, receta.didPaciente, 'emision-receta')
        presentToast({
            message: "Enviando receta al paciente",
            color: "success",
            cssClass: "toast",
            duration: 2000,
            position: "top"
        })
    }

    useImperativeHandle(forwardedRef, () => ({
        send(receta: Receta) {
            if (!currentProfile) return;
            if (receta.didPaciente === currentProfile.didId) {
                envioRecetaProfilePaciente(receta)
            } else if (ProfileHandler.isMedico(currentProfile)) {
                envioRecetaProfileMedico(receta)
            } else if (ProfileHandler.isPaciente(currentProfile)) {
                envioRecetaProfilePaciente(receta)
            }
        },
        solicitudConfirmacion(receta: Receta) {
            if (!currentProfile) return;
            recetaService.sendReceta(currentProfile, receta, receta.didPaciente, 'solicitud-confirmacion-dispensa')
        }
    }));

    return (<>
        {/* <ModalScanner onScan={scanCallback} ref={modalScanner} close={() => {}} isOpen={false} /> */}
        <ModalScanner onScan={scanCallback}
            isOpen={isScanOpen}
            close={() => {
                setIsScanOpen(false);
            }}
            ref={modalScanner}
        />
        <IonAlert ref={promptDid}
            header="Por favor, proporcione el ID de la farmacia."
            buttons={['OK']}
            inputs={[
                {
                    placeholder: 'did:recetasbc:abcdef...',
                },
            ]}
            onDidDismiss={({ detail }) => { promptDidCallback(detail.data.values[0]) }}
        ></IonAlert>
    </>
    );
}

export default React.forwardRef(RecetaSender);
