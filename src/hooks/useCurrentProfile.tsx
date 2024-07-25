import React, { Dispatch, SetStateAction, useEffect } from 'react'
import Profile from '../model/Profile';
import RecetaBcData from '../service/RecetaBcData';

const useCurrentProfile = (callback?: () => void): { currentProfile: Profile | null, setCurrentProfile: Dispatch<SetStateAction<Profile | null>> } => {
  const data = RecetaBcData.getInstance()
  const [currentProfile, setCurrentProfile] = React.useState<Profile | null>(null);

  useEffect(() => {
    setCurrentProfile(data.getCurrentProfile());
    const s = data.observeProfile().subscribe((p) => {
      setCurrentProfile(p);
      if (callback) callback()
    })

    return () => {
      s.unsubscribe()
    }
  }, [])


  return { currentProfile, setCurrentProfile }
}

export default useCurrentProfile