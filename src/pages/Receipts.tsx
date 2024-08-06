import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import RecetaBcData, { RecetaFolder } from "../service/RecetaBcData";
import {
    useCurrentProfile,
    useDebounce,
    useFilterReceipts,
    useQuery,
    useReceipts,
} from "../hooks";
import Receta from "../model/Receta";
import ReceiptCard, { ReceiptCardAction } from "../components/ReceiptCard";
import { IonIcon } from "@ionic/react";
import { searchOutline } from "ionicons/icons";
import usePlatforms from "../hooks/usePlatforms";
import { ROLES } from "./CreateUser";
import { useHistory } from "react-router";
import RecetaReceiver from "../message/RecetaReceiver";
import NoReceipts from "../components/NoReceipts";
import useNoReceiptValues from "../hooks/useNoReceiptValues";
import useCheckUserRole from "../hooks/useCheckUserRole";
import { Subscription } from 'rxjs';

export type ParamType = "emit" | "sent" | "dispens_made" | "pending" | "my";

interface Sub extends Subscription { query?: string };

export const RECEIPT_FOLDER_TYPE: { [k in ParamType]: RecetaFolder } = {
    emit: "salida",
    sent: "salida",
    dispens_made: "salida",
    pending: "entrada",
    my: "entrada",
};

const QUERY_TYPE_TILTE: { [k in ParamType]: string } = {
    emit: "Recetas Emitidas",
    sent: "Recetas Enviadas",
    dispens_made: "Dispansas Realizada",
    pending: "Recetas pendientes",
    my: "Mis Recetas",
};

const checkRole: { [k: string]: string } = {
    emit: "med",
    sent: "pac",
    my: "pac",
    dispens_made: "far",
    pending: "far"
}

const Receipts: React.FC = () => {
    const data = RecetaBcData.getInstance();
    const [receipts, setReceipts] = useState<Receta[]>([]);
    const [search, setSearch] = useState<string>("");
    const { query } = useQuery(["type"]);
    const { currentProfile } = useCurrentProfile();
    const { isMobile } = usePlatforms();

    useCheckUserRole(checkRole[query?.type], "/")

    const refreshReceipts = (folder: RecetaFolder) => {
        if (!currentProfile) {
            setReceipts([]);
            return;
        }
        data.getRecetasFromFolder(folder).then((r) => {
            setReceipts(r);
        });
    };

    const { Component, sendReceta, confirmReceta } = useReceipts(
        currentProfile,
        () => {
            // Refresh de recetas cuando se envia o se confirma
            refreshReceipts(RECEIPT_FOLDER_TYPE[query?.type as ParamType]);
        }
    );

    // Refresh de recetas cuando se cambia de perfil o de query
    useEffect(() => {
        refreshReceipts(RECEIPT_FOLDER_TYPE[query?.type as ParamType]);
    }, [currentProfile, query?.type]);

    const [subs, setSubs] = useState<Sub[]>()

    useEffect(() => {
        const sub: Sub = data.observeRecetas().subscribe((r) => {
            if (r.estado === "pendiente-confirmacion-dispensa" && query?.type === "my") return
            setReceipts((prev) => {
                if (r.estado === "pendiente-confirmacion-dispensa" && query?.type === "sent" && !!prev) {
                    const filterPrev = prev.filter((re) => re.id !== r.id)
                    return [r, ...filterPrev]
                }
                const findReceipt = prev.find((re) => re.id === r.id);
                if (!prev && !findReceipt) return [r];
                if (!!prev && !findReceipt) return [...prev, r];
                return prev;
            });
        });

        if (!!subs) {
            const filterSubs = subs?.filter((s) => s.query !== query?.type)
            for (let s of filterSubs) {
                s.unsubscribe()
                setSubs(subs?.filter((s) => s.query === query?.type))
            }
        }

        sub.query = query?.type
        setSubs(prev => !!prev ? [...prev, sub] : [sub])

    }, [query?.type]);

    const debounceSearch = useDebounce(search, 800);
    const receiptsResult = useFilterReceipts(receipts, debounceSearch)

    const history = useHistory();

    const actions = useMemo<ReceiptCardAction | undefined>(() => {
        if (currentProfile?.roles) {
            const role = currentProfile?.roles[0];
            if (role === ROLES.PACIENTE && query?.type === "my") {
                return [
                    {
                        type: "send",
                        onClick: (r: Receta) => sendReceta(r),
                    },
                ];
            }
            if (role === ROLES.PACIENTE && query?.type === "sent") {
                return [
                    {
                        type: "confirm",
                        onClick: (r: Receta) => confirmReceta(r),
                    },
                ];
            }
            if (role === ROLES.FARMACIA && query?.type === "pending") {
                return [
                    {
                        type: "dispens",
                        onClick: (r: Receta) => history.push(`/receipt?id=${r.id}`),
                    },
                ];
            }
        }
    }, [currentProfile?.roles, query?.type]);

    const noValuesObj = useNoReceiptValues()

    return (
        <ReceiptsStyled>
            {!isMobile && (
                <div className="receipt-header">
                    <p className="title-hola">{"Hola,"}</p>
                    <p className="title-name">{currentProfile?.name || ""}</p>
                </div>
            )}
            <div className="receipt-search">
                <p className="title-search">
                    {QUERY_TYPE_TILTE[query?.type as ParamType]}
                </p>
                <div className="input-search-wrapper">
                    <input
                        placeholder="Buscar Receta"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-search"
                    />
                    <IonIcon
                        icon={searchOutline}
                        className="input-search-icon"
                        color="dark"
                    />
                </div>
            </div>
            <div className="receipts-wrapper scrollbarNone">
                {receiptsResult?.length === 0 && (
                    <NoReceipts {...noValuesObj} />
                )}
                {receiptsResult?.length > 0 &&
                    receiptsResult.map((receipt) => (
                        <>
                            <ReceiptCard
                                receipt={receipt}
                                key={receipt?.id}
                                actions={actions}
                            />
                        </>
                    ))}
                {Component}
            </div>
        </ReceiptsStyled>
    );
};

export default Receipts;

const ReceiptsStyled = styled.div`
  width: 100%;
  height: 100%;
  color: #000;
  display: flex;
  background: var(--ion-color-light);
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  @media (max-width:500px){
      padding: 1em;
    }
    @media (min-width:500px){
        padding: 2em;
            }
  p {
    margin: 0;
  }

  .receipts-wrapper {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1em;
      overflow-y: scroll;
      height: 100%;
      width: 100%;
      
      @media (max-width:500px){
        padding: 0 0 7em 0;
    }
    @media (min-width:500px){
        padding: 1em 0 6em 0;
            }

    .no-results {
      color: #000;
      font-size: 1.5em;
    }
  }

  .receipt-header {
    padding: 0 0 2em 0;
    .title-hola {
      font-size: 1.3em;
      font-weight: 500;
    }
    .title-name {
      font-size: 2.5em;
      color: var(--ion-color-primary);
      font-weight: 500;
    }
  }

  .receipt-search {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 1em;
    @media (max-width:500px){
        padding: 0 0 1em 0;
    }
    @media (min-width:500px){
        padding: 0 0 2em 0;
            }
    .title-search {
      font-size: 1.3em;
      font-weight: 500;
    }
    .input-search-wrapper {
      padding: 0.5em;
      border: 1px solid #c6c6c6;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      gap: 1em;
      .input-search {
          @media (max-width:500px){
        }
            @media (min-width:500px){
                padding: 0.5em;
            }
        :focus {
          border: none;
        }
        width: 100%;
        color: #000;
        background: transparent;
        border: none;
      }
      .input-search-icon {
      }
    }
  }
`;
