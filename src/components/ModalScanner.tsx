import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent } from "@ionic/react";
import React, { useEffect, useState } from "react";
//import React from "react";
import { useImperativeHandle, useRef } from "react";
import QrScanner from "qr-scanner";
import QrFrame from "../assets/qr-frame.svg";

import './ModalScanner.css';
// import useSound from "use-sound";
import popSoundEffect from '../assets/pop-94319.mp3';
import styled from "styled-components";


export type HTMLModalScanner = {
    open: () => Promise<void>,
    dismiss: () => Promise<boolean>
}

interface ContainerProps {
    onScan: (data: string) => void,
    close: () => void,
    isOpen: boolean
}

const ModalScanner: React.ForwardRefRenderFunction<HTMLModalScanner, ContainerProps> = (props, forwardedRef) => {

    const modal = useRef<HTMLIonModalElement>(null);

    let scanner: QrScanner | null = null
    const videoEl = useRef<HTMLVideoElement>(null);
    const qrBoxEl = useRef<HTMLDivElement>(null);
    // const [pop] = useSound(popSoundEffect, { volume: 0.5 })

    const [data, setData] = useState<string>("")
    const [qrOn, setQrOn] = useState<boolean>(true);

    const dismiss = () => {
        props.close()
        stopAll()
        return modal.current!.dismiss();
    }

    useImperativeHandle(forwardedRef, () => ({
        open() {
            return modal.current!.present();
        },
        dismiss() {
            return dismiss()
        },
    }));


    // Success
    const onScanSuccess = (result: QrScanner.ScanResult) => {
        // 🖨 Print the "result" to browser console.
        console.log(result);
        // ✅ Handle success.
        // 😎 You can do whatever you want with the scanned result.
        setData(result?.data)
        // pop()
        props.onScan(result?.data)
    };

    // Fail
    const onScanFail = (err: string | Error) => {
        // 🖨 Print the "err" to browser console.
        console.log(err);
    };

    const instaciateScanner = () => {
        console.log("Instanciando")
        // 👉 Instantiate the QR Scanner
        scanner = new QrScanner(videoEl!.current!, onScanSuccess, {
            onDecodeError: onScanFail,
            // 📷 This is the camera facing mode. In mobile devices, "environment" means back camera and "user" means front camera.
            preferredCamera: "environment",
            // 🖼 This will help us position our "QrFrame.svg" so that user can only scan when qr code is put in between our QrFrame.svg.
            highlightScanRegion: true,
            // 🔥 This will produce a yellow (default color) outline around the qr code that we scan, showing a proof that our qr-scanner is scanning that qr code.
            highlightCodeOutline: true,
            // 📦 A custom div which will pair with "highlightScanRegion" option above 👆. This gives us full control over our scan region.
            overlay: qrBoxEl?.current || undefined,
        });
    }


    const stopAll = () => {
        scanner?.stop()
        console.log("Stoppeando", scanner)
        /*scanner?.destroy()*/
    }

    const startAll = () => {
        if (!scanner) {
            instaciateScanner();
        }

        // 🚀 Start QR Scanner
        scanner?.start()
            .then(() => {
                console.log("Starteado")
            }).catch((err) => {
                console.log("Error al startear", err)
                setQrOn(false);
            })
        console.log("Starteando", scanner)
    }


    // ❌ If "camera" is not allowed in browser permissions, show an alert.
    useEffect(() => {
        if (!qrOn)
            alert(
                "Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload."
            );
    }, [qrOn]);

    return (
        <IonModal ref={modal} onDidDismiss={() => { props.close(); stopAll(); }} isOpen={props.isOpen} onIonModalDidPresent={() => startAll()} onIonModalDidDismiss={() => stopAll()}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Scan</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => dismiss()}>Cerrar</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContentStyled>
                <video ref={videoEl}>
                </video>
                <div ref={qrBoxEl} className="qr-box">
                    <img src={QrFrame}
                        width={256}
                        height={256}
                        className="qr-frame"
                    />
                </div>
            </IonContentStyled>
        </IonModal>
    );
};

export default React.forwardRef(ModalScanner);

const IonContentStyled = styled.div`
width: 100%;
height: 90%;
position: relative;
    video{
        border: none;
        width: 100%;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) !important;
    }
    .qr-box {
        border: none !important;
        width: 100% !important;
        height: 50% !important;
        position: absolute !important;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
}

.qr-frame {
    position: absolute;
    width: 50%;
    height: auto;
    fill: none;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) !important;
  }
`

