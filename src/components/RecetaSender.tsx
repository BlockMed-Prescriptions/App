

import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import Receta from '../model/Receta';
import RecetaService from '../receta/RecetaService';
import Profile from '../model/Profile';
import RecetaBcData from '../service/RecetaBcData';
import ProfileHandler from '../service/ProfileHandler';
import { IonAlert, useIonActionSheet, useIonToast } from '@ionic/react';
import ModalScanner, { HTMLModalScanner } from './ModalScanner';
import { qrCode, key, close, keypad } from 'ionicons/icons';
import { DIDResolver } from '../quarkid/DIDResolver';

interface ContainerProps {
    
}

export type HTMLRecetaSender = {
    send: (receta: Receta) => void,
    solicitudConfirmacion (receta: Receta): void
}

const RecetaSender: React.ForwardRefRenderFunction<HTMLRecetaSender, ContainerProps> = (props, forwardedRef) => {
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [presentToast] = useIonToast();
    const [presentActionSheet] = useIonActionSheet();

    const recetaService = RecetaService.getInstance()
    const data = RecetaBcData.getInstance()
    const modalScanner = useRef<HTMLModalScanner>(null);
    const promptDid = useRef<HTMLIonAlertElement>(null);

    useEffect(() => {
        setCurrentProfile(data.getCurrentProfile());
        const s = data.observeProfile().subscribe((p) => {
            setCurrentProfile(p);
        })

        return () => {
            s.unsubscribe()
        }
    }, [data])

    let recetaCallback: Receta|null = null;
    const scanCallback = (scanned: string) => {
        const profileTarget = ProfileHandler.fromQrCode(scanned)
        if (profileTarget) {
            if (!ProfileHandler.isFarmacia(profileTarget)) {
                presentToast({
                    message: "El código QR no corresponde a una farmacia.",
                    color: "danger",
                    duration: 2000,
                    position: "top"
                })
            } else {
                presentToast({
                    message: "Enviando receta a la farmacia.",
                    color: "success",
                    duration: 2000,
                    position: "top"
                })
                recetaService.sendReceta(currentProfile!, recetaCallback!, profileTarget.didId, 'envio-farmacia')
                recetaCallback!.estado = 'enviada-farmacia'
                data.saveReceta(recetaCallback!)
            }
        }
    }

    const promptDidCallback = (did: string) => {
        if (did) {
            console.log("Prompt DID", did, recetaCallback)
            DIDResolver(did).then((doc) => {
                recetaService.sendReceta(currentProfile!, recetaCallback!, did, 'envio-farmacia')
                recetaCallback!.estado = 'enviada-farmacia'
                data.saveReceta(recetaCallback!)
                presentToast({
                    message: "Enviando receta a la farmacia.",
                    color: "success",
                    duration: 2000,
                    position: "top"
                })
            }).catch((e) => {
                presentToast({
                    message: "Revise el ID de farmacia ... No se pudo enviar la receta.",
                    color: "danger",
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
                        modalScanner.current?.open()
                    }
                },
                {
                    text: "Ingresar código manualmente",
                    icon: keypad,
                    handler: () => {
                        console.log("Ingresar código manualmente")
                        recetaCallback = receta;
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
        <ModalScanner onScan={scanCallback} ref={modalScanner} />
        <IonAlert ref={promptDid}
            header="Por favor, proporcione el ID de la farmacia."
            buttons={['OK']}
            inputs={[
                {
                    placeholder: 'did:recetasbc:abcdef...',
                },
            ]}
            onDidDismiss={({detail}) => {promptDidCallback(detail.data.values[0])}}
      ></IonAlert>
    </>
  );
}

export default React.forwardRef(RecetaSender);
