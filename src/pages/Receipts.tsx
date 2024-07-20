import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import RecetaBcData, { RecetaFolder } from '../service/RecetaBcData'
import { useCurrentProfile, useDebounce, useQuery } from '../hooks';
import Receta from '../model/Receta';
import RecetaCard from '../components/RecetaCard';
import ReceiptCard from '../components/ReceiptCard';
import { IonIcon } from '@ionic/react';
import { searchOutline } from 'ionicons/icons';

export type ParamType =
    | "emit"
    | "sent"
    | "dispens_made"
    | "pending"
    | "my";

const RECEIPT_FOLDER_TYPE: { [k in ParamType]: RecetaFolder } = {
    emit: "salida",
    sent: "salida",
    dispens_made: "salida",
    pending: "entrada",
    my: "entrada",
}

const QUERY_TYPE_TILTE: { [k in ParamType]: string } = {
    emit: "Recetas Emitidas",
    sent: "Recetas Enviadas",
    dispens_made: "Dispansas Realizada",
    pending: "Recetas pendientes",
    my: "Mis Recetas",
}

const Receipts: React.FC = () => {
    const data = RecetaBcData.getInstance();
    const [receipts, setReceipts] = useState<Receta[]>([]);
    const [search, setSearch] = useState<string>("");
    const { query } = useQuery(["type", "test"])
    const { currentProfile } = useCurrentProfile();
    const role = useMemo(() => {
        if (currentProfile) {
            return currentProfile.roles[0]
        }
    }, [currentProfile])

    const refreshReceipts = (folder: RecetaFolder) => {
        if (!currentProfile) {
            setReceipts([]);
            return;
        }
        data.getRecetasFromFolder(folder).then((r) => {
            setReceipts(r);
        });
    }

    useEffect(() => {
        refreshReceipts(RECEIPT_FOLDER_TYPE[query?.type as ParamType])
    }, [currentProfile, query?.type])

    const debounceSearch = useDebounce(search, 800)

    const receiptsResult = useMemo<Receta[]>(() => {
        if (!debounceSearch) return receipts
        const receiptsFiltered = receipts.filter((r: Receta) => {
            if (r.nombrePaciente.toLowerCase().includes(debounceSearch.toLowerCase())) return true
            if (r?.credencial && r.credencial.toLowerCase().includes(debounceSearch.toLowerCase())) return true
            if (r?.didPaciente && r.didPaciente.toLowerCase().includes(debounceSearch.toLowerCase())) return true
            if (r.medicamentos.find((m) => m.toLowerCase().includes(debounceSearch.toLowerCase()))) return true
        }
        )
        return receiptsFiltered
    }, [debounceSearch, receipts])

    // title: "Recetas Emitidas",
    // url: "/folder/Emitidas",
    // emit

    // title: "Dispensas realizadas",
    // pageTitle: "Dispensas realizadas",
    // dispens_made

    // title: "Recetas Enviadas",
    // url: "/folder/Outbox",
    // sent

    // title: "Recetas pendientes",
    // url: "/folder/Recibidas",
    // pending

    // title: "Mis recetas",
    // url: "/folder/Inbox",
    // my

    return (
        <ReceiptsStyled>
            <div className='receipt-header'>
                <p className='title-hola'>{"Hola,"}</p>
                <p className='title-name'>{currentProfile?.name || ""}</p>
            </div>
            <div className='receipt-search'>
                <p className='title-search'>{QUERY_TYPE_TILTE[query?.type as ParamType]}</p>
                <div className='input-search-wrapper'>
                    <input placeholder='Buscar Receta' value={search} onChange={(e) => setSearch(e.target.value)} className='input-search' />
                    <IonIcon icon={searchOutline} className='input-search-icon' color="dark" />
                </div>
            </div>
            <div className='receipts-wrapper scrollbarNone'>
                {receiptsResult?.length === 0 &&
                    <p className='no-results'>{"No encontramos ninguna receta"}</p>
                }
                {receiptsResult?.length > 0 &&
                    receiptsResult.map((receipt) =>
                        <ReceiptCard receipt={receipt} key={receipt?.id}
                        // onClickSend={() => sendReceta(receta)}
                        // onClickArchive={canSendArchive() ? (() => sendArchive(receta)) : undefined}
                        // onClickFavorite={() => toggleFavorite(receta)}
                        // onClickTrash={canDelete() ? (() => deleteReceta(receta)) : undefined}
                        />
                    )}
            </div>
        </ReceiptsStyled>
    )
}

export default Receipts

const ReceiptsStyled = styled.div`
    width: 100%;
    height: 100%;
    color: #000;
    display: flex;
    background: var(--ion-color-light);
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 2em;
    p{
        margin: 0;
    }

    
    .receipts-wrapper{
        padding: 1em 0 1em 0;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        width: 100%;
        gap: 1em;
        height: 56%;
        overflow-y: scroll;

        .no-results{
            color: #000;
            font-size: 1.5em;
            
        }
    }

    .receipt-header{
        padding: 0 0 5em 0;
        .title-hola{
            font-size: 1.3em;
            font-weight: 500;
        }
        .title-name{
            font-size: 2.5em;
            color: var(--ion-color-primary);
            font-weight: 500;
        }
    }
    
    .receipt-search{
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 1em;
        padding: 0 0 2em 0;
        .title-search{
            font-size: 1.3em;
            font-weight: 500;
        }
        .input-search-wrapper{
            padding: 0.5em;
            border: 1px solid #c6c6c6;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            width: 100%;
            gap: 1em;
            .input-search{
                :focus{
                    border: none;
                }
                padding: 0.5em;
                width: 100%;
                color: #000;
                background: transparent;
                border: none;
            }
            .input-search-icon{
                
            }
        }
    }
    
    `