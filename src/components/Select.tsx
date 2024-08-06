import {
    IonAlert,
    IonIcon,
    AlertInput,
} from "@ionic/react";
import { chevronDownOutline } from "ionicons/icons";
import React, { useState } from "react";
import styled from "styled-components";

interface SelectTypes {
    options: SelectOption[];
    value?: SelectOption;
    onChange: (v: SelectOption) => void;
    inputBackground?: string;
    alertHeader?: string;
    fontSize?: string;
    error?: string | undefined;
    readonly?: boolean
    className?: string
}

export interface SelectOption {
    value: string;
    label: string;
}

const Select: React.FC<SelectTypes> = ({
    options,
    value,
    onChange,
    alertHeader,
    error,
    readonly,
    ...props
}) => {
    const [dialogValue, setDialogValue] = useState<SelectOption | undefined>(value);

    return (
        <div className={props.className}>
            <SelectStyled
                id="present-alert"
                disabled={readonly}
                onClick={() => setDialogValue(value)}
                {...props}
            >
                {value?.label}
                <IonIcon icon={chevronDownOutline} />
            </SelectStyled>
            {error && (
                <ErrorStyled>
                    <p>{error}</p>
                </ErrorStyled>
            )}

            <IonAlert
                trigger="present-alert"
                header={alertHeader}
                buttons={[
                    {
                        text: "Cancel",
                        role: "cancel",
                    },
                    {
                        text: "OK",
                        role: "confirm",
                        cssClass: "--color: #fff",
                        handler: () => {
                            if (dialogValue) {
                                onChange(dialogValue);
                            }
                        },
                    },
                ]}
                inputs={options.map((op: SelectOption) => ({
                    label: op.label,
                    type: "radio",
                    value: op.value,
                    handler: (data: AlertInput) => {
                        setDialogValue({
                            value: data.value || "none",
                            label: data.label || "none",
                        });
                    },
                    checked: op.value === dialogValue?.value,
                }))}
            />
        </div>
    );
};

export default Select;

interface SelectStyledTypes {
    inputBackground?: string;
    fontSize?: string;
}

const SelectStyled = styled.button<SelectStyledTypes>`
  display: flex;
  justify-content: space-between;
  padding: 0.8em;
  border-radius: 5px;
  border-bottom: 1px solid #cecece;
  background: transparent;
  width: 100%;
  font-size: ${(prop) => prop.fontSize || "1.5em"};
  background: ${(prop) => prop.inputBackground || "#fff"};
  color: #000;
`;

const ErrorStyled = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  font-size: 0.7em;
  color: var(--ion-color-danger-tint);
  p {
    margin: 0;
  }
`;
