import { IonItem, IonRadio, IonRadioGroup } from '@ionic/react'
import React from 'react'
import styled from 'styled-components'

interface RadioTypes {
    options: RadioOption[]
    onChange: (v: string) => void,
    value: string
}

export type RadioOption = { id: string, label: string }

const Radio: React.FC<RadioTypes> = ({ options, onChange, value }) => {
    const compareWith = (o1: string, o2: string) => {
        return o1 === o2;
    };
    return (
        <RadioStyled
            value={value}
            compareWith={compareWith}
            onIonChange={(ev) => onChange(ev.detail.value)}
        >
            {options.map((option) => (
                <IonItem key={option.id}>
                    <IonRadio value={option.id}>
                        {option.label}
                    </IonRadio>
                </IonItem>
            ))}
        </RadioStyled>
    )
}

export default Radio

const RadioStyled = styled(IonRadioGroup)`
    width: 100%;
    border-radius: 5px;
    padding: 1em;
    font-size: 1em;
`