
import React, { useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";

interface UseQueryReturn {
    query: { [k: string]: string },
    haveQuery: boolean,
    changeQuery: (prop: { [k: string]: string }) => void,
    queryToPath: string
}


const useQuery = (keys: string[]): UseQueryReturn => {
    const { search, pathname } = useLocation();
    const history = useHistory();

    const currentQueryParameters = new URLSearchParams(useLocation().search)

    const getQuery = () => {
        let res: { [k: string]: string } = {};
        for (let key of keys) {
            let value = currentQueryParameters?.get(key);
            try {
                value = JSON.parse(value || "");
                // value = JSON.parse(value || "");
            } catch (e) { }
            if (value) {
                res[key] = value;
            }
        }
        return res;
    };

    const query: { [k: string]: string } | undefined = React.useMemo(() => {
        if (keys?.length > 0) {
            return getQuery();
        }
        return {}
    }, [keys, search]);

    const changeQuery = (newQuery: { [k: string]: string }) => {
        const newQueryParameters = new URLSearchParams();
        const currentQuery = getQuery();
        const checkQuery: { [k: string]: string } = { ...currentQuery, ...newQuery };
        for (let key of Object.keys(checkQuery)) {
            const value =
                typeof checkQuery[key] === "object"
                    ? JSON.stringify(checkQuery[key])
                    : checkQuery[key];

            newQueryParameters.set(key, value);
        }
        history.push(`${pathname}?${newQueryParameters.toString()}`)
    };

    const queryToPath = useMemo(() => {
        let newPath = `?`;
        let index = 1;
        const queryArrayKeys = Object.keys(query || {});
        for (let k of queryArrayKeys) {

            const value = query[k];
            let addQuery = "";
            if (index > 1) {
                addQuery = "&";
            }
            addQuery = addQuery + k + "=";
            if (typeof value === "object") {
                newPath = newPath + addQuery + JSON.stringify(value);
            } else {
                newPath = newPath + addQuery + value;
            }
            index = index + 1;
        }
        return newPath;
    }, [query]);

    const haveQuery = React.useMemo(() => {
        if (query) {
            let res = false;
            for (let key of Object.keys(query)) {
                if (query[key]) res = true;
            }
            return res;
        }
        return false
    }, [query]);

    return { query, haveQuery, changeQuery, queryToPath };
};

export default useQuery;