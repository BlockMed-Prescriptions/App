import { IonIcon } from "@ionic/react";
import { medalOutline } from "ionicons/icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import ModalCertificado, { HTMLModalCertificado } from "./ModalCertificado";
import { default as ProfileModel } from "../model/Profile";
import { DIDResolver } from "../quarkid/DIDResolver";
import Button from "./Button";
import usePlatforms from "../hooks/usePlatforms";

interface ShowCertificateTypes {
    profile?: ProfileModel | null;
    text?: string;
    isMobileHideText?: boolean
    showWaitingOnVerification?: boolean
    certificate?: any,
    modalTitle?: string;
}

const ShowCertificate: React.FC<ShowCertificateTypes> = ({ profile, certificate, text, modalTitle, isMobileHideText, showWaitingOnVerification }) => {
    const modalCertificado = useRef<HTMLModalCertificado>(null);
    const [didDocument, setDidDocument] = useState<any | null>(null);
    const { isMobile } = usePlatforms();

    const getDidDocument = (p: ProfileModel) => {
        DIDResolver(p.didId)
            .then((doc) => {
                setDidDocument(doc);
            })
            .catch((e) => {
                setDidDocument(null);
            });
    };

    useEffect(() => {
        if (!!profile && !certificate) {
            getDidDocument(profile);
        }
    }, [profile]);

    const showText = useMemo(() => {
        if (!isMobile) {
            return true
        }
        if (!!isMobileHideText) {
            return false
        }
        return true
    }, [isMobileHideText, isMobile])

    if (!didDocument && !certificate && !!showWaitingOnVerification) return <div style={{ color: "#000", opacity: ".5", fontSize: "0.8em" }}>
        {"esperando certificación..."}
    </div>
    if (!didDocument && !certificate) return <></>

    if (text) {
        return (
            <ShowCertificateStyled>
                <Button
                    type="primary-outline"
                    onClick={() => modalCertificado.current?.open()}
                    padding="0.5em 0.8em 0.5em 0.8em"
                >
                    <div className="certificate-button">
                        <IonIcon
                            icon={medalOutline}
                            color={"primary"}
                        />
                        {showText &&
                            <span>{text}</span>
                        }
                    </div>
                </Button>
                <ModalCertificado ref={modalCertificado} title={modalTitle} certificado={certificate || didDocument} />
            </ShowCertificateStyled>
        )
    }

    return (
        <ShowCertificateStyled>
            <IonIcon
                icon={medalOutline}
                color={"primary"}
                onClick={() => modalCertificado.current?.open()}
            />
            <ModalCertificado ref={modalCertificado} certificado={didDocument} />
        </ShowCertificateStyled>
    );
};

export default ShowCertificate;

const ShowCertificateStyled = styled.div`
.certificate-button{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1em;
    font-size: 0.8em;
}
        ion-icon {
      font-size: 1.5em;
      cursor: pointer;
    }
`;
