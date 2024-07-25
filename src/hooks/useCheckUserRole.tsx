import React, { useEffect, useMemo } from 'react'
import useCurrentProfile from './useCurrentProfile';
import { useHistory } from 'react-router';

const useCheckUserRole = (check: string, to: string) => {
    const { currentProfile } = useCurrentProfile();
    const history = useHistory()
    const role = useMemo(() => currentProfile?.roles[0] || "", [currentProfile])

    useEffect(() => {
        if (!role) return
        if (!currentProfile) return
        if (!check) return
        if (role !== check) {
            history.push(to)
        }
    }, [currentProfile, role, to, check])
}

export default useCheckUserRole