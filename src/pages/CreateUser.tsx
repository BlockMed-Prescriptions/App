import React, { useEffect, useState } from 'react'
import RecetaBcData from '../service/RecetaBcData'
import { useProfile, useValidation, userUserRole } from '../hooks';
import { useHistory } from 'react-router';
import styled from 'styled-components';
import InputText from '../components/InputText';
import { IonIcon } from '@ionic/react';
import { medkitOutline, personOutline, pulseOutline } from 'ionicons/icons';
import Button from '../components/Button';
import { Validate } from '../hooks/useValidation';

export const ROLES_TILE: { [k: string]: string } = {
    pac: "Paciente",
    med: "Medico",
    far: "Farmacia"
}

export const ROLES: { [k in "PACIENTE" | "MEDICO" | "FARMACIA"]: string } = {
    PACIENTE: "pac",
    MEDICO: "med",
    FARMACIA: "far"
}

const ROLES_ICONS: { [k: string]: string } = {
    pac: personOutline,
    med: pulseOutline,
    far: medkitOutline
}

const initValues = {
    name: "",
    email: ""
}

const validate: Validate[] = [
    {
        keyValue: "name",
        custome: "Nombre y Apellido",
        valid: [{ key: "required" }],
    },
    {
        keyValue: "email",
        custome: "Email",
        valid: [{ key: "required" }, { key: "email" }],
    },
]

const CreateUser: React.FC = () => {
    const data = RecetaBcData.getInstance()
    const [values, setValues] = useState<{ name: string, email: string }>(initValues)
    const [showErrors, setShowErrors] = useState<boolean>(false)
    const { role, isLoaded: isLoadedRole } = userUserRole();
    const { create } = useProfile(role);
    const history = useHistory();

    useEffect(() => {
        if (!role && !!isLoadedRole) {
            history.push("/")
            return
        };
        if (!role && !isLoadedRole) {
            return
        };
    }, [role, isLoadedRole])

    const { errors, hasErrors } = useValidation({
        values,
        validate,
    });

    if (!role) return <></>

    return (
        <CreateUserStyled>
            <div className='create-user-container'>
                <div className='form-container'>
                    <IonIcon className='title-icon' icon={ROLES_ICONS[role || ""]} />
                    <p className='title'>{`Crear Usuario ${ROLES_TILE[role || ""]}`}</p>
                    <InputText
                        value={values?.name}
                        onChange={(v) => setValues(prev => ({ ...prev, name: v }))}
                        label={role === "far" ? "Nombre de farmacia" : "Nombre y Apellido"}
                        error={showErrors ? errors?.name : ""}
                    />
                    <InputText
                        value={values?.email}
                        onChange={(v) => setValues(prev => ({ ...prev, email: v }))}
                        label={"Email"}
                        error={showErrors ? errors?.email : ""}
                    />
                    <div className='actions-container'>
                        <Button type="clear-cancel" onClick={() => history.push("/")} label="Cancelar" />
                        <Button onClick={() => {
                            if (hasErrors) {
                                setShowErrors(true)
                                return;
                            }
                            create(values.name, values.email)
                        }} label="Confirmar" />
                    </div>
                </div>
            </div>
        </CreateUserStyled>
    )
}

export default CreateUser

const CreateUserStyled = styled.div`
    width: 100%; 
    height: 100vh;
    background: var(--ion-color-light);
    display: flex;
    justify-content: center;
    align-items: center;
    .create-user-container{
        position: relative;
        width: 100%;
        height: 100%;
        max-width: 700px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        @media (max-width:500px){
            padding: 1em;
        }
        @media (min-width:500px){
            padding: 4em;
        }
        color: var(--ion-color-primary);
        .title-icon{
            font-size: 5em;
        }
        .form-container{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 1em;
            .title{
                padding: 0em 0em 1em 0em;
                font-size: 2em;
                font-weight: 500;
                margin: 0;
            }
            .actions-container{
                padding: 2em 0em 0em 0em;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: end;
            }
        }
    }
        `