import { useIonToast } from "@ionic/react";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import InputText from "../components/InputText";
import Button from "../components/Button";
import FinanciadorProvider from "../service/FinanciadorProvider";
import Select, { SelectOption } from "../components/Select";
import useValidation, { Validate } from "../hooks/useValidation";
import {
    cameraOutline,
    checkmarkCircleOutline,
    closeCircleOutline,
} from "ionicons/icons";
import ModalScanner from "../components/ModalScanner";
import ProfileHandler from "../service/ProfileHandler";
import { DIDResolver } from "../quarkid/DIDResolver";
import { RecetaGenerator } from "../receta/RecetaGenerator";
import Receta from "../model/Receta";
import { useHistory } from "react-router";
import { useCurrentProfile } from "../hooks";
import PacienteProvider from "../receta/PacienteProvider";
import useCheckUserRole from "../hooks/useCheckUserRole";

interface NewReceiptTypes { }

interface NewReceipt {
    didPaciente: string;
    name: string;
    financier: SelectOption;
    credential: string;
    prescription: string;
    diagnosis: string;
}

const initValues = {
    didPaciente: "",
    name: "",
    financier: {
        value: "",
        label: "Financiador",
    },
    credential: "",
    prescription: "",
    diagnosis: "",
};

const validate: Validate[] = [
    {
        keyValue: "name",
        custome: "Nombre y Apellido Paciente",
        valid: [{ key: "required" }],
    },
    {
        keyValue: "didPaciente",
        custome: "Identificador Paciente",
        valid: [{ key: "required" }, { key: "did" }],
    },
    {
        keyValue: "credential",
        custome: "Identificador Paciente",
        valid: [{ key: "required" }],
    },
    {
        keyValue: "financier",
        custome: "Financiador",
        valid: [{ key: "required" }],
    },
    {
        keyValue: "credential",
        custome: "No de Credencial",
        valid: [{ key: "required" }],
    },
    {
        keyValue: "prescription",
        custome: "Prescipción",
        valid: [{ key: "required" }],
    },
    {
        keyValue: "diagnosis",
        custome: "Diagnóstico",
        valid: [{ key: "required" }],
    },
];

const NewReceipt: React.FC<NewReceiptTypes> = () => {
    const [values, setValues] = useState<NewReceipt>(initValues);
    const { currentProfile } = useCurrentProfile();
    const [financiers, setFinanciers] = useState<SelectOption[]>([]);
    const [showErrors, setShowErrors] = useState<boolean>(false);
    const financiadorProvider = FinanciadorProvider.getInstance();
    const pacienteProvider = PacienteProvider.getInstance()
    const [DIDErrorText, setDIDErrorText] = useState<string>("");
    const history = useHistory();

    useCheckUserRole("med", "/")

    const onChange = (k: keyof NewReceipt, v: string | SelectOption) => {
        if (k === "didPaciente" && !!v) {
            pacienteProvider.getPaciente(v as string).then((paciente) => {
                if (paciente) {
                    setValues(prev => ({
                        ...prev,
                        name: paciente.nombre,
                        credential: paciente.credencial || "",
                    }))
                    if (paciente.financiador) {
                        financiadorProvider.getFinanciador(paciente.financiador).then((f) => {
                            if (f) {
                                setValues(prev => ({ ...prev, financier: { value: f.did, label: f.nombre } }))
                            }
                        })
                    }
                }
            })
        }
        setValues((prev) => ({ ...prev, [k]: v }));
        setShowErrors(false);
        setDIDErrorText("");
    };

    useEffect(() => {
        financiadorProvider
            .getFinanciadores()
            .then((f) =>
                setFinanciers(f.map((i) => ({ value: i.did, label: i.nombre })))
            );
    }, []);

    const { errors, hasErrors } = useValidation({
        values: { ...values, financier: values?.financier?.value },
        validate,
    });

    const [isScanOpen, setIsScanOpen] = useState<boolean>(false);
    const scanData = (data: string) => {
        let profileTarget = ProfileHandler.fromQrCode(data);
        if (profileTarget) {
            setValues((prev) => ({
                ...prev,
                didPaciente: profileTarget.didId,
                name: profileTarget.name,
            }));
        }
        setIsScanOpen(false);
    };

    const [presentToast, dismissToast] = useIonToast();

    return (
        <NewReceiptStyled className="scrollbarNone">
            <p className="title">{"Nueva Receta"}</p>
            <div className="form-container">
                <InputText
                    value={currentProfile?.didId || ""}
                    disabled
                    label="Identificador Médico"
                />
                <InputText
                    value={currentProfile?.name || ""}
                    disabled
                    label="Nombre y Apellido Médico"
                />
                <InputText
                    value={values.didPaciente}
                    onChange={(v) => onChange("didPaciente", v)}
                    label="Identificador Paciente"
                    error={showErrors ? errors?.didPaciente || DIDErrorText : ""}
                    prompt={{ icon: cameraOutline, onClick: () => setIsScanOpen(true) }}
                />
                <ModalScanner
                    isOpen={isScanOpen}
                    onScan={(data) => {
                        scanData(data);
                    }}
                    close={() => {
                        setIsScanOpen(false);
                    }}
                />
                <InputText
                    value={values.name}
                    onChange={(v) => onChange("name", v)}
                    label="Nombre y Apellido Paciente"
                    error={showErrors ? errors?.name : ""}
                    labelPlacement="stacked"
                />
                <Select
                    options={financiers}
                    onChange={(v) => onChange("financier", v)}
                    value={values.financier}
                    fontSize="1.1em"
                    alertHeader="Financiador"
                    error={showErrors ? errors?.financier : ""}
                />
                <InputText
                    value={values.credential}
                    onChange={(v) => onChange("credential", v)}
                    label="No de Credencial"
                    error={showErrors ? errors?.credential : ""}
                    labelPlacement="stacked"
                />
                <InputText
                    value={values.prescription}
                    onChange={(v) => onChange("prescription", v)}
                    label="Prescipción"
                    error={showErrors ? errors?.prescription : ""}
                    labelPlacement="stacked"
                />
                <InputText
                    value={values.diagnosis}
                    onChange={(v) => onChange("diagnosis", v)}
                    label="Diagnóstico"
                    error={showErrors ? errors?.diagnosis : ""}
                    labelPlacement="stacked"
                />
                <div className="form-actions">
                    <Button label="CANCELAR" type="clear-cancel" onClick={() => history.goBack()} />
                    <Button
                        label="CONFIRMAR"
                        onClick={async () => {
                            if (hasErrors) {
                                setShowErrors(true);
                                return;
                            }
                            let isDidResolved = true;
                            try {
                                await DIDResolver(values.didPaciente);
                            } catch (err) {
                                setShowErrors(true);
                                setDIDErrorText(
                                    "El Identificador Paciente no pudo ser resuelto."
                                );
                                isDidResolved = false;
                            }
                            if (!isDidResolved) return;
                            RecetaGenerator(
                                currentProfile!,
                                values.didPaciente,
                                values.name,
                                [values.prescription],
                                values.diagnosis,
                                values.financier.value,
                                values.credential,
                                presentToast,
                                dismissToast
                            )
                                .then((receta: Receta) => {
                                    presentToast({
                                        message:
                                            "La receta se ha enviado correctamente al paciente",
                                        position: "top",
                                        color: "success",
                                        cssClass: "toast",
                                        icon: checkmarkCircleOutline,
                                        buttons: [
                                            {
                                                text: "Aceptar",
                                                handler: () => {
                                                    dismissToast();
                                                },
                                            },
                                        ],
                                    });

                                    // me muevo a la carpeta de salida
                                    history.push("/receipts?type=emit");
                                })
                                .catch((e) => {
                                    console.error(e);
                                    presentToast({
                                        message: "Error al generar la receta. ",
                                        // duration: 2000,
                                        position: "top",
                                        color: "danger",
                                        icon: closeCircleOutline,
                                        cssClass: "toast",
                                        buttons: [
                                            {
                                                text: "Aceptar",
                                                role: "cancel",
                                            },
                                        ],
                                    });
                                });
                        }}
                    />
                </div>
            </div>
        </NewReceiptStyled>
    );
};

export default NewReceipt;

const NewReceiptStyled = styled.div`
  padding: 3em 2em 6em 2em;
  overflow-y: scroll;
  height: 100%;
  background: var(--ion-color-light);
  .prompt-icon {
    color: #000;
    font-size: 1.5em;
    /* height: 100%; */
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0 0.5em 0 1em;
  }
  .title {
    font-size: 1.6em;
    color: #000;
    font-weight: 500;
    margin: 0;
  }
  .form-container {
    padding: 2em 0 0 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1em;
    .form-actions {
      padding: 1em 0 0 0;
      width: 100%;
      display: flex;
      justify-content: end;
      align-items: center;
      gap: 0.5em;
    }
  }
`;
