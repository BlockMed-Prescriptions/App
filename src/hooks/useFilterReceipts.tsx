import React, { useMemo } from 'react'
import Receta from '../model/Receta'
import useQuery from './useQuery';

const useFilterReceipts = (receipts: Receta[], debounceSearch: string): Receta[] => {
    const { query } = useQuery(["type"]);

    const sortByDate = (array: Receta[], key: keyof Receta) =>
        array.sort((a, b) => b[key].valueOf() - a[key].valueOf());

    const receiptsResult = useMemo<Receta[]>(() => {
        if (!debounceSearch) {
            if (query?.type === "dispens_made" || query?.type === "sent")
                return receipts.sort(
                    (a, b) =>
                        new Date(b.dispensa?.fechaDispensa!).valueOf() -
                        new Date(a.dispensa?.fechaDispensa!).valueOf()
                );
            return sortByDate(receipts, "fechaEmision");
        }
        const receiptsFiltered = receipts.filter((r: Receta) => {
            if (r.nombrePaciente.toLowerCase().includes(debounceSearch.toLowerCase()))
                return true;
            if (
                r?.credencial &&
                r.credencial.toLowerCase().includes(debounceSearch.toLowerCase())
            )
                return true;
            if (
                r?.didPaciente &&
                r.didPaciente.toLowerCase().includes(debounceSearch.toLowerCase())
            )
                return true;
            if (
                r.medicamentos.find((m) =>
                    m.toLowerCase().includes(debounceSearch.toLowerCase())
                )
            )
                return true;
        });
        // return receiptsFiltered.sort((a, b) => b.fechaEmision.valueOf() - a.fechaEmision.valueOf());
        if (query?.type === "dispens_made" || query?.type === "sent")
            return receiptsFiltered.sort(
                (a, b) =>
                    new Date(b.dispensa?.fechaDispensa!).valueOf() -
                    new Date(a.dispensa?.fechaDispensa!).valueOf()
            );
        return sortByDate(receiptsFiltered, "fechaEmision");
    }, [debounceSearch, receipts]);

    return receiptsResult
}

export default useFilterReceipts