import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useCurrentProfile, useProfile } from "../hooks";
import InputText from "../components/InputText";
import {
    arrowDownCircleOutline,
    arrowUpCircleOutline,
    copyOutline,
    medalOutline,
    qrCodeOutline,
    trashOutline,
} from "ionicons/icons";
import { IonIcon, IonModal, useIonToast } from "@ionic/react";
import Button from "../components/Button";
import { default as ProfileModel } from "../model/Profile";
import { DIDResolver } from "../quarkid/DIDResolver";
import ModalCertificado, {
    HTMLModalCertificado,
} from "../components/ModalCertificado";
import QRCode from "react-qr-code";
import ProfileHandler from "../service/ProfileHandler";
import ShowCertificate from "../components/ShowCertificate";

interface ProfileTypes { }

const Profile: React.FC<ProfileTypes> = () => {
    const { currentProfile } = useCurrentProfile();
    const [presentToast] = useIonToast();
    const copyDid = () => {
        navigator.clipboard.writeText(currentProfile?.didId || "");
        presentToast({
            message: "DID copiado en portapapeles",
            cssClass: "toast",
            color: "success",
            duration: 2000,
            position: "top",
        });
    };
    const { importPerfiles, exportPerfil, deletePerfil } = useProfile();

    const [didDocument, setDidDocument] = useState<any | null>(null);

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
        if (!!currentProfile) {
            getDidDocument(currentProfile);
        }
    }, [currentProfile]);

    const modalCertificado = useRef<HTMLModalCertificado>(null);
    const modal = useRef<HTMLIonModalElement>(null);
    return (
        <ProfileStyled className="scrollbarNone">
            <div className="profile-header">
                <p className="profile-title">{"Tu Perfil"}</p>
                <ShowCertificate profile={currentProfile} isText isMobileHideText showWaitingOnVerification />
            </div>
            <InputText
                value={currentProfile?.name}
                readonly
                label="Nombre y Apelllido"
            />
            <InputText value={currentProfile?.email} readonly label="Email" />
            <InputText
                value={currentProfile?.didId}
                readonly
                label="DID"
                onClick={copyDid}
                prompt={{ icon: copyOutline, onClick: copyDid }}
            />
            <div className="profile-actions-wrapper">
                <div className="profile-actions-left">

                    <Button onClick={() => importPerfiles()} padding="0.5em 1em 0.5em 1em">
                        <div className="profile-button">
                            <IonIcon icon={arrowDownCircleOutline} />
                        </div>
                    </Button>
                    <Button
                        onClick={() => exportPerfil(currentProfile!)}
                        padding="0.5em 1em 0.5em 1em"
                    >
                        <div className="profile-button">
                            <IonIcon icon={arrowUpCircleOutline} />
                        </div>
                    </Button>
                    <Button
                        type="cancel"
                        onClick={() => deletePerfil(currentProfile!)}
                        padding="0.5em 1em 0.5em 1em"
                    >
                        <div className="profile-button">
                            <IonIcon icon={trashOutline} />
                        </div>
                    </Button>
                </div>
                <div className="profile-qr-wrapper">
                    <Button
                        onClick={() => modal.current?.present()}
                        type="primary-outline"
                        padding="0.4em 0.8em 0.4em 0.8em"
                    >
                        <div className="button-qr">
                            <IonIcon icon={qrCodeOutline} />
                        </div>
                    </Button>
                    <IonModal
                        ref={modal}
                        initialBreakpoint={0.7}
                        breakpoints={[0, 0.25, 0.5, 0.75]}
                    >
                        <QRCodeStyled>
                            <QRCode
                                value={
                                    currentProfile ? ProfileHandler.toQrCode(currentProfile) : ""
                                }
                                size={320}
                            />
                        </QRCodeStyled>
                    </IonModal>
                </div>
            </div>
        </ProfileStyled>
    );
};

export default Profile;

const QRCodeStyled = styled.div`
  display: flex;
  justify-content: center;
  padding: 5em 1em 0 1em;
  align-items: center;
`;

const ProfileStyled = styled.div`
  background-color: var(--ion-color-light);
  height: 100vh;
  overflow-y: scroll;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1em;
  justify-content: start;
  align-items: center;
  p {
    margin: 0;
  }
  .prompt-icon {
    @media (max-width: 500px) {
      font-size: 1.2em;
    }
    @media (min-width: 500px) {
      font-size: 1.5em;
    }
  }
  @media (max-width: 500px) {
    padding: 1em;
  }
  @media (min-width: 500px) {
    padding: 5em;
  }
  .profile-header {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 1em;
    padding: 0 0 0.5em 0;
    .profile-title {
      color: #000;
      font-size: 1.5em;
      margin: 0;
    }
  }

  .profile-actions-wrapper {
    display: flex;
    @media (max-width: 500px) {
      padding: 1em 0 0 0;
    }
    justify-content: space-between;
    @media (min-width: 500px) {
      padding: 2em 0 0 0;
    }
    align-items: center;
    gap: 1em;
    width: 100%;
    .profile-qr-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      .button-qr {
        width: 100%;
        gap: 1em;
        height: fit-content;
        display: flex;
        align-items: center;
        justify-content: center;
        ion-icon {
          font-size: 1.5em;
        }
      }
    }
    .profile-actions-left {
      display: flex;
      align-items: center;
      gap: 1em;
      .profile-button {
        display: flex;
        align-items: center;
        gap: 0.5em;
        ion-icon {
          font-size: 1.3em;
        }
      }
    }
  }
`;
