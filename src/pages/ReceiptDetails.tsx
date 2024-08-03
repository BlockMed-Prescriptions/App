import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useCurrentProfile, useQuery, useReceipts } from "../hooks";
import RecetaBcData from "../service/RecetaBcData";
import { useHistory } from "react-router";
import Receta, { RecetaEstado } from "../model/Receta";
import InputText from "../components/InputText";
import Select, { SelectOption } from "../components/Select";
import FinanciadorProvider from "../service/FinanciadorProvider";
import useValidation, { Validate } from "../hooks/useValidation";
import Button from "../components/Button";
import { IonIcon, useIonToast } from "@ionic/react";
import {
    checkmarkDoneCircleOutline,
    medkitOutline,
    sendOutline,
} from "ionicons/icons";
import { DispensaGenerator } from "../receta/DispensaGenerator";
import ShowCertificate from "../components/ShowCertificate";
import ShowHash from "../components/ShowHash";
import ReceiptCertificates from "../components/ReceiptCertificates";

const RECEIPT_WITH_ACTIONS: RecetaEstado[] = [
    "enviada-farmacia",
    "pendiente-confirmacion-dispensa",
    "emitida",
];

interface ReceiptDetailsTypes { }

interface ValuesTypes {
    medicamentos: string[];
    lotes: string[];
}

const initValues = {
    medicamentos: [""],
    lotes: [""],
};

const ReceiptDetails: React.FC<ReceiptDetailsTypes> = ({ }) => {
    const [values, setValues] = useState<ValuesTypes>(initValues);
    const [receipt, setReceipt] = useState<Receta | null>(null);
    const { currentProfile } = useCurrentProfile();
    const data = RecetaBcData.getInstance();
    const financiadorProvider = FinanciadorProvider.getInstance();
    const { query } = useQuery(["id"]);
    const history = useHistory();
    const [financiers, setFinanciers] = useState<SelectOption[]>([]);
    const [showErrors, setShowErrors] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const { Component, sendReceta, confirmReceta } = useReceipts(
        currentProfile,
        () => history.push("/receipts?type=sent")
    );

    useEffect(() => {
        if (currentProfile) {
            if (!query?.id) {
                history.push(showActions?.redirect || "/"); // Change to work with all roles
                return;
            }
            data
                .getReceta(query?.id)
                .then((receipt: Receta) => {
                    setReceipt(receipt);
                })
                .catch((er) => {
                    history.push("/");
                });
        }
    }, [currentProfile, query?.id, data]);

    useEffect(() => {
        financiadorProvider
            .getFinanciadores()
            .then((f) =>
                setFinanciers(f.map((i) => ({ value: i.did, label: i.nombre })))
            );
    }, []);

    const validate = useMemo<Validate[] | []>(() => {
        if (receipt?.estado === "enviada-farmacia")
            return [
                {
                    keyValue: "lotes",
                    custome: "Lotes",
                    valid: [{ key: "required-string-array" }],
                },
                {
                    keyValue: "medicamentos",
                    custome: "Medicamentos",
                    valid: [{ key: "required-string-array" }],
                },
            ];
        return [];
    }, [receipt]);

    const onChange = (k: keyof ValuesTypes, v: string[]) => {
        setValues((prev) => ({ ...prev, [k]: v }));
        setShowErrors(false);
    };

    const { errors, hasErrors } = useValidation({
        values: { ...values },
        validate,
    });

    const showActions = useMemo<{
        show: boolean;
        label?: string;
        onClick?: () => Promise<void>;
        redirect?: string;
        showInputs?: "dispens" | "send";
        icon?: any;
        readonly?: boolean;
    } | null>(() => {
        if (!receipt?.estado) return null;
        if (!RECEIPT_WITH_ACTIONS.includes(receipt?.estado)) return null;
        const role = currentProfile?.roles ? currentProfile.roles[0] : "";

        if (
            receipt?.estado === "pendiente-confirmacion-dispensa" &&
            role === "pac"
        ) {
            return {
                show: true,
                label: "CONFIRMAR",
                redirect: "/receipts?type=sent",
                onClick: async () => {
                    confirmReceta(receipt);
                },
                icon: checkmarkDoneCircleOutline,
            };
        }
        if (receipt?.estado === "emitida" && role === "pac") {
            return {
                show: true,
                label: "ENVIAR",
                redirect: "/receipts?type=my",
                showInputs: "send",
                onClick: async () => {
                    sendReceta(receipt);
                },
                icon: sendOutline,
            };
        }
        if (receipt?.estado === "enviada-farmacia" && role === "far") {
            return {
                show: true,
                label: "DISPENSAR",
                redirect: "/receipts?type=pending",
                showInputs: "dispens",
                onClick: async () => {
                    await DispensaGenerator(
                        currentProfile!,
                        receipt!,
                        values.medicamentos,
                        values.lotes,
                        presentToast,
                        dismissToast
                    ).then((dispensa) => {
                        setLoading(false);
                        history.push("/receipts?type=pending");
                    });
                },
                icon: medkitOutline,
            };
        }
        return null;
    }, [receipt, currentProfile, values]);

    const [presentToast, dismissToast] = useIonToast();

    return (
        <ReceiptDetailsStyled className="scrollbarNone">
            <div className="receipt-details-header fullWidth">
                <p className="receipt-details-title">{"Detalle receta"}</p>
                <ReceiptCertificates receipt={receipt} />
            </div>
            <div className="receipt-details-half-inputs">
                <InputText
                    value={
                        receipt?.fechaEmision
                            ? new Date(receipt?.fechaEmision).toLocaleString("es", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                            })
                            : ""
                    }
                    disabled={!receipt?.fechaEmision}
                    readonly
                    label="Fecha de Emision"
                />
                <InputText
                    value={
                        receipt?.fechaVencimiento
                            ? new Date(receipt?.fechaVencimiento).toLocaleString("es", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                            })
                            : ""
                    }
                    disabled={!receipt?.fechaVencimiento}
                    readonly
                    label="Fecha de Vencimmiento"
                />
            </div>
            <InputText
                value={receipt?.didMedico}
                disabled={!receipt?.didMedico}
                readonly
                label="Identificador Médico"
            />
            <InputText
                value={
                    receipt?.certificado?.credentialSubject
                        ? receipt?.certificado?.credentialSubject["schema:author"][
                        "schema:name"
                        ]
                        : null
                }
                disabled={!receipt?.certificado?.credentialSubject}
                readonly
                label="Nombre y Apelllido Médico"
            />
            <InputText
                value={receipt?.didPaciente}
                disabled={!receipt?.didPaciente}
                readonly
                label="Identificador Paciente"
            />
            <InputText
                value={receipt?.nombrePaciente}
                disabled={!receipt?.nombrePaciente}
                readonly
                label="Nombre y Apelllido Paciente"
            />

            <Select
                options={financiers}
                className="fullWidth"
                onChange={(v) => { }}
                readonly
                value={financiers?.find((f) => f.value === receipt?.didFinanciador)}
                fontSize="1.1em"
                alertHeader="Financiador"
            />
            <InputText
                value={receipt?.credencial || ""}
                disabled={!receipt?.credencial}
                readonly
                label="No de credencial"
            />
            <InputText
                value={
                    !!receipt?.medicamentos ? `  •  ${receipt?.medicamentos[0]}` : ""
                }
                disabled={!receipt?.medicamentos}
                readonly
                label="Prescipción"
            />
            <InputText
                value={receipt?.indicaciones}
                disabled={!receipt?.indicaciones}
                readonly
                label="Diagnóstico"
            />
            {showActions?.showInputs === "send" && <>{Component}</>}
            {showActions?.showInputs === "dispens" && (
                <>
                    <InputText
                        value={!!values?.medicamentos ? values?.medicamentos[0] : ""}
                        onChange={(v) => onChange("medicamentos", [v])}
                        error={showErrors ? errors?.medicamentos : ""}
                        label="Medicamentos"
                    />
                    <InputText
                        value={!!values?.lotes ? values?.lotes[0] : ""}
                        onChange={(v) => onChange("lotes", [v])}
                        error={showErrors ? errors?.lotes : ""}
                        label="Lote"
                    />
                </>
            )}
            {showActions?.show && (
                <div className="receipt-details-action-wrapper">
                    <Button
                        label="VOLVER"
                        type="clear-cancel"
                        onClick={() => history.push(showActions?.redirect || "/")}
                    />
                    <Button
                        loading={loading}
                        onClick={async () => {
                            if (hasErrors) {
                                setShowErrors(true);
                                return;
                            }
                            setLoading(true);
                            if (showActions?.onClick) await showActions?.onClick();
                            setLoading(false);
                        }}
                    >
                        <div className="button-action-ok">
                            <IonIcon icon={showActions?.icon} />
                            <p>{showActions?.label}</p>
                        </div>
                    </Button>
                </div>
            )}
            <div className="receipt-details-info fullWidth">
                {receipt?.transactionHashEmision && (
                    <ShowHash
                        hash={receipt?.transactionHashEmision}
                        url="sepolia"
                        label="hash emision: "
                    />
                )}
                {receipt?.transactionHashDispensa && (
                    <ShowHash
                        hash={receipt?.transactionHashDispensa}
                        url="sepolia"
                        label="hash dispensa: "
                    />
                )}
                {receipt?.estado && (
                    <p className="receipt-status">{`estado: ${receipt?.estado}`}</p>
                )}
            </div>
        </ReceiptDetailsStyled>
    );
};

export default ReceiptDetails;

const ReceiptDetailsStyled = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background: var(--ion-color-light);
  overflow-y: scroll;
  .fullWidth {
    width: 100%;
  }
  gap: 1em;
  height: 100%;
  @media (max-width: 500px) {
    padding: 1em 1em 5em 1em;
  }
  @media (min-width: 500px) {
    padding: 4em 4em 6em 4em;
  }
  .receipt-details-info {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    gap: 0.5em;
    padding: 0 0 1em 0;
    .receipt-status {
      color: #000;
      opacity: 0.5;
      font-size: 0.8em;
      margin: 0;
    }
  }
  .receipt-details-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1em;
    @media (max-width: 990px) {
      flex-direction: column;
    }
    @media (min-width: 990px) {
    }
      .receipt-details-title {
        color: #000;
        font-size: 1.5em;
        margin: 0;
      }
  }
  .receipt-details-action-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .button-action-ok {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1em;
      position: relative;
      ion-icon {
        font-size: 1.2em;
      }
      p {
        margin: 0;
      }
    }
  }
  .receipt-details-half-inputs {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1em;
    @media (max-width: 500px) {
      flex-direction: column;
      justify-content: center;
    }
    @media (min-width: 500px) {
      justify-content: space-between;
    }
    div {
      @media (min-width: 500px) {
        width: 50% !important;
      }
    }
  }
`;
