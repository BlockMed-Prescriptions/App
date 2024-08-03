import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useCurrentProfile } from "../hooks";
import ProfileHandler from "../service/ProfileHandler";
import PacienteProvider, { Paciente } from "../receta/PacienteProvider";
import { IonIcon } from "@ionic/react";
import { sendOutline } from "ionicons/icons";
import { useHistory } from "react-router";

interface PacientsTypes { }

interface QueryReceipt {
    didPaciente: string;
    name: string;
    financier: string | null;
    credential: string | null;
}

const Pacients: React.FC<PacientsTypes> = () => {
    const pacienteProvider = PacienteProvider.getInstance();
    const { currentProfile } = useCurrentProfile();
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const history = useHistory();

    useEffect(() => {
        if (currentProfile && ProfileHandler.isMedico(currentProfile)) {
            pacienteProvider.getPacientes().then((p) => {
                setPacientes(
                    p.sort(
                        (a, b) =>
                            new Date(b.lastReceta!).valueOf() -
                            new Date(a.lastReceta!).valueOf()
                    )
                );
            });
        } else {
            setPacientes([]);
        }
    }, [currentProfile]);

    return (
        <PacientsStyled className="scrollbarNone">
            {pacientes &&
                pacientes.map((p) => {
                    const query: QueryReceipt = {
                        didPaciente: p.did,
                        name: p.nombre,
                        financier: p.financiador,
                        credential: p.credencial,
                    };
                    let path = "";
                    for (let q of Object.keys(query)) {
                        const v = query[q as keyof QueryReceipt];
                        if (!!v && q === "credential") {
                            path = path + `${q}=${v}`;
                        }
                        if (!!v && q !== "credential") {
                            path = path + `${q}=${v}&`;
                        }
                    }
                    return (
                        <div className="pacient-wrapper">
                            <div className="p-left-wrapper">
                                <p className="p-name">{p.nombre}</p>
                                <p className="p-info">{`Financiador: ${p.financiadorNombre || "no registrado"
                                    }`}</p>
                                <p className="p-info">{`Ultima receta: ${p.lastReceta?.toLocaleString(
                                    "es",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "numeric",
                                    }
                                )}`}</p>
                            </div>
                            <div
                                className="p-action"
                                onClick={() => history.push(`/new_receipt?${path}`)}
                            >
                                <IonIcon slot="icon-only" icon={sendOutline}></IonIcon>
                            </div>
                        </div>
                    );
                })}
        </PacientsStyled>
    );
};

export default Pacients;

const PacientsStyled = styled.div`
  width: 100%;
  height: 100%;
  color: #000;
  display: flex;
  background: var(--ion-color-light);
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 1em 1em 5em 1em;
  gap: 0.5em;
  overflow-y: scroll;

  .pacient-wrapper {
    background-color: #fff;
    width: 100%;
    border-radius: 10px;
    padding: 0.5em;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5em;
    box-shadow: 0px 0px 20px -3px rgba(189, 189, 189, 1);
    .p-action {
      background: var(--ion-color-primary);
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10px;
      cursor: pointer;
      ion-icon{
        transform: rotate(330deg);
      }
      @media (max-width: 500px) {
        padding: 0.4em 0.4em 0.5em 0.4em;
        font-size: 1em;
      }
      @media (min-width: 500px) {
        padding: 0.4em 0.4em 0.5em 0.4em;
        font-size: 1.4em;
      }
    }
    .p-left-wrapper {
      p {
        margin: 0.5em 0 0.5em 0;
      }
      .p-name {
        font-size: 1em;
      }
      .p-info {
        font-size: 0.8em;
        opacity: 0.5;
      }
    }
  }
`;
