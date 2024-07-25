import React, { useMemo } from "react";

interface useValidationTypes {
    values: { [k: string]: any },
    validate: Validate[]
}

export type Validate = {
    keyValue: string,
    valid: {
        key: KeyValue,
        value?: any,
        message?: string,
    }[],
    custome?: string,
}

type Error = { [key: string]: string }

type KeyValue = "required-custome" | "required-string-array" | "did" | "did-resolver" | "text-max" | "text-min" | "string-not-only-number" | "required-number" | "equals" | "blacklist" | "email" | "special-character" | "required" | "string-not-spaces" | "string-not-only-letters" | "string-not-only-number"

const useValidation = ({ values, validate }: useValidationTypes): { errors: Error, hasErrors: boolean } => {
    const VALIDATIONS = {
        "special-character": /[^\w]/,
        email:
            /(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi,
    };
    const validation = (keyValue: string, key: KeyValue, value: any, custome: any): { error: boolean, message: string } => {
        switch (key) {
            case "did":
                return {
                    error: !values[keyValue].match(/^did:[a-z0-9]+:[a-zA-Z0-9\-\_]+$/),
                    message: custome
                        ? `El ${custome} debe tener la forma did:method:id.`
                        : `El Identificador debe tener la forma did:method:id.`
                };
            case "did-resolver":
                return {
                    error: !values[keyValue].match(/^did:[a-z0-9]+:[a-zA-Z0-9\-\_]+$/),
                    message: custome
                        ? `El ${custome} debe tener la forma did:method:id.`
                        : `El Identificador debe tener la forma did:method:id.`
                };
            case "text-min":
                return {
                    error: values[keyValue]?.length < value,
                    message: `Tiene que ser mas de ${value} caracteres`,
                };
            case "text-max":
                return {
                    error: values[keyValue]?.length >= value,
                    message: `Tiene que ser menos de ${value} caracteres`,
                };
            case "special-character":
                return {
                    error: !values[keyValue]?.match(VALIDATIONS[key]),
                    message: "Tiene que tener por lo menos un caracter especial",
                };
            case "email":
                return {
                    error: !values[keyValue]?.match(VALIDATIONS[key]),
                    // error: VALIDATIONS[key].test(values[key]),
                    message: "Tiene que ser un email valido",
                };
            case "equals":
                return {
                    error: values[keyValue] !== value.value,
                    message: custome
                        ? `${custome} tiene que ser igual a ${value.message}`
                        : `Tiene que ser igual a  ${value.message}`,
                };
            case "required-number":
                return {
                    error: isNaN(values[keyValue] as number),
                    message: custome
                        ? `${custome} tiene que tener un numero`
                        : "Tiene que tener un numero",
                };
            case "string-not-only-number":
                return {
                    error: typeof values[keyValue] === "string" ? /^\d+$/.test(values[keyValue]) : false,
                    message: "No puede ser solo numeros",
                };
            case "string-not-only-letters":
                return {
                    error: /^[A-Za-z]+$/.test(values[keyValue]),
                    message: "No puede ser solo texto",
                };
            case "string-not-spaces":
                return {
                    error: /\s/.test(values[keyValue]),
                    message: "No puede tener espacios",
                };
            case "required-string-array":
                return {
                    error: !!values[keyValue] ? !values[keyValue][0] : true,
                    message: custome
                        ? `${custome} es requerido`
                        : "Este campo es requrido",
                };
            case "required":
                return {
                    error: !values[keyValue],
                    message: custome
                        ? `${custome} es requerido`
                        : "Este campo es requrido",
                };
            default:
                return {
                    error: false,
                    message: ""
                };
        }
    };
    const errors = useMemo<Error>(() => {
        let error: Error = {
            message: ""
        };
        for (let i in validate) {
            const validateValue = validate[i];
            const conditional = !!validateValue.valid.find(
                (item) => item.key === "required" || item.key === "required-custome"
            ) || values[validateValue.keyValue];
            if (conditional) {
                for (let index in validateValue.valid) {
                    const validValue = validateValue.valid[index];
                    const isValid = validation(
                        validateValue.keyValue,
                        validValue.key,
                        validValue?.value,
                        validateValue.custome
                    );
                    if (!!isValid.error) {
                        error = {}
                        error[validateValue.keyValue] = isValid.message;
                    }
                }
            }
        }
        return error;
    }, [validate, values]);

    const hasErrors = useMemo(() => {
        let error = false;
        for (let key of Object.keys(values)) {
            if (errors[key]) {
                error = true;
            }
        }
        return error;
    }, [errors]);

    return { errors, hasErrors };
};

export default useValidation
