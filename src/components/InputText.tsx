import { IonIcon, IonInput } from '@ionic/react'
import React from 'react'
import styled from 'styled-components'

interface InputTextTypes {
    value: string | undefined,
    onChange?: (v: string) => void,
    label?: string,
    error?: string | undefined,
    disabled?: boolean,
    readonly?: boolean,
    prompt?: {
        icon: string,
        onClick: () => void
    },
    labelPlacement?: "end" | "fixed" | "floating" | "stacked" | "start"
}

const InputText: React.FC<InputTextTypes> = ({ value, onChange = () => { }, label, error, disabled, prompt, labelPlacement = "floating", ...props }) => {

    return (
        <div style={{ width: "100%" }}>
            <InputTextStyled
                value={value}
                disabled={disabled}
                onIonInput={(event) => onChange(event.detail.value || "")}
                labelPlacement={labelPlacement}
                {...props}
            >
                {label &&
                    <div slot="label">
                        {label}
                    </div>
                }
                {prompt &&
                    <IonIcon onClick={prompt.onClick} className='prompt-icon' slot="end" icon={prompt?.icon}></IonIcon>
                }
            </InputTextStyled>
            {error &&
                <ErrorStyled>
                    <p>{error}</p>
                </ErrorStyled>
            }
        </div>
    )
}

export default InputText

interface InputTextContainerTypes {
    prompt: boolean
}

const InputTextContainer = styled.div<InputTextContainerTypes>`
width: 100%;
.prompt-input-container{
    display: flex;
    width: 100%;
    align-items: center;
}
`

interface InputTextStyledTypes {
}

const InputTextStyled = styled(IonInput) <InputTextStyledTypes>`
    background: #fff;
    color: #000;
    width: 100%;
    border-radius: 2px;
    border-bottom: 1px solid #cecece;
    padding: 0 0.5em 0 0.5em !important;
`

const ErrorStyled = styled.div`
    width: 100%;
    display: flex;
    justify-content: flex-start;
    font-size: 0.7em;
    color: var(--ion-color-danger-tint);
    padding: 0 0.5em 0 0.5em;
    p{
        margin: 0;
    }
`