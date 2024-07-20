
import React, { useEffect } from 'react'
import RecetaBcData from '../service/RecetaBcData';

export type Role = "pac" | "med" | "far" | null

const userUserRole = (): { role: Role, isLoaded: boolean } => {
    const data = RecetaBcData.getInstance()
    const [userRole, setUserRole] = React.useState<Role>(null);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);

    useEffect(() => {
        setIsLoaded(false)
        data.getUserRole().then((m) => {
            setUserRole(m);
            setIsLoaded(true)
        })
    }, [])

    return { role: userRole, isLoaded }
}

export default userUserRole