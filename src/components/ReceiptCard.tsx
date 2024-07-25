import React from "react";
import styled from "styled-components";
import Receta from "../model/Receta";
import ProfileButton from "./ProfileButton";
import Button from "./Button";
import { IonIcon } from "@ionic/react";
import { checkmarkDoneCircleOutline, medkitOutline, sendOutline } from "ionicons/icons";
import { useHistory } from "react-router";

interface ReceiptCardTypes {
    receipt: Receta;
    actions?: ReceiptCardAction;
}

export type ReceiptCardAction = [
    {
        type: "send" | "dispens" | "confirm";
        onClick: (p: Receta) => void;
    }
];

const ReceiptCard: React.FC<ReceiptCardTypes> = ({ receipt, actions }) => {
    const history = useHistory();

    return (
        <ReceiptCardStyled>
            <div className="receipt-card-header">
                <ProfileButton name={receipt.nombrePaciente || ""} />
                <div className="recepit-header-title">
                    <p className="pac-name">{receipt.nombrePaciente}</p>
                    <p className="receipt-card-light-text">
                        {new Date(receipt.fechaEmision).toLocaleString("es", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                        })}
                    </p>
                </div>
            </div>
            <div className="receipt-card-content scrollbarNone">
                <p className="receipt-card-light-text">{"Prescripción"}</p>
                {receipt.medicamentos.map((m) => (
                    <div className="receipt-card-content-med" key={receipt?.id + "med"}>
                        <div className="dot"></div>
                        <p>{m}</p>
                    </div>
                ))}
            </div>
            <div className="receipt-card-footer">
                {actions &&
                    actions.map((ac) => {
                        let icon = sendOutline
                        let rotate = false
                        let size = "1.18em"
                        let onClick = ac.onClick
                        if (ac.type === "dispens") icon = medkitOutline
                        if (ac.type === "send") rotate = true
                        if (ac.type === "confirm" && receipt.estado === "pendiente-confirmacion-dispensa") {
                            icon = checkmarkDoneCircleOutline
                            size = "1.3em"
                        }
                        if (ac.type === "confirm" && receipt.estado !== "pendiente-confirmacion-dispensa") {
                            return <div></div>
                        }
                        return (
                            <div className="action-button" key={receipt.id + "action"} onClick={() => {
                                onClick(receipt)
                            }}>
                                <ReceiptFooterIcon rotate={rotate} size={size}>
                                    <IonIcon
                                        icon={icon}
                                    />
                                </ReceiptFooterIcon>
                            </div>
                        )
                    })}
                {!actions && <div></div>}
                <Button
                    label="Ver Receta"
                    onClick={() => history.push(`/receipt?id=${receipt.id}`)}
                />
            </div>
        </ReceiptCardStyled>
    );
};

export default ReceiptCard;

const ReceiptFooterIcon = styled.div<{ rotate: boolean, size: string }>`
  ${(p) => (!!p.rotate ? "transform: rotate(330deg);" : "")}
  color: var(--ion-color-primary);
  font-size: ${p => p.size};
  display: flex;
  align-items: center;
`;

const ReceiptCardStyled = styled.div`
  width: 100%;
  height: fit-content;
  max-width: 20em;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0px 0px 20px -3px rgba(189, 189, 189, 1);
  .receipt-card-header {
    padding: 1em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1em;
    .recepit-header-title {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      .pac-name {
        color: #000;
        font-size: 1.2em;
        font-weight: 500;
      }
    }
  }
  .receipt-card-light-text {
    color: #000;
    opacity: 0.5;
    font-size: 0.9em;
    font-weight: 400;
  }
  .receipt-card-content {
    background: #fafafa;
    padding: 1em;
    @media (max-width:500px){
        height: 11em;
    }
    @media (min-width:500px){
        height: 15em;
    }
    overflow-y: scroll;
    .receipt-card-content-med {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 1em 0 0 1em;
      gap: 1em;
      .dot {
        width: 0.4em;
        height: 0.4em;
        background: #000;
        border-radius: 100%;
      }
      p {
        color: #000;
        font-size: 1.2em;
        font-weight: 400;
      }
    }
  }
  .receipt-card-footer {
    padding: 1em;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .action-button {
      border: 1px solid var(--ion-color-primary);
      cursor: pointer;
      border-radius: 5px;
      padding: 0.4em 0.5em 0.4em 0.5em;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`;
