import React from "react";
import Receta from "../model/Receta";
import useQuery from "./useQuery";

const useFilterReceipts = (
    receipts: Receta[] = [],
    debounceSearch: string
): Receta[] => {
    const { query } = useQuery(["type"]);

    const sortByDate = (array: Receta[], key: keyof Receta) =>
        array.sort((a, b) => new Date(b[key]).valueOf() - new Date(a[key]).valueOf());

    const generateResult = (): Receta[] => {
        let receiptsFiltered = receipts;
        if (!!debounceSearch) {
            receiptsFiltered = receipts.filter((r: Receta) => {
                if (
                    r.nombrePaciente.toLowerCase().includes(debounceSearch.toLowerCase())
                )
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
        }
        if (query?.type === "sent" || query?.type === "dispens_made") {
            const receiptsActionSort = receiptsFiltered
                .filter((r) => r.estado === "pendiente-confirmacion-dispensa")
                .sort(
                    (a, b) =>
                        new Date(b.dispensa?.fechaDispensa!).valueOf() -
                        new Date(a.dispensa?.fechaDispensa!).valueOf()
                );
            const receiptsRest = receiptsFiltered.filter(
                (r) => r.estado !== "pendiente-confirmacion-dispensa"
            );
            return [...receiptsActionSort, ...receiptsRest];
        }
        return sortByDate(receiptsFiltered, "fechaEmision");
    }

    const receiptsResult = generateResult();

    return receiptsResult;
};

export default useFilterReceipts;
