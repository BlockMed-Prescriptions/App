import React, { useEffect, useState } from 'react'
import { getPlatforms } from '@ionic/react';


const usePlatforms = (): { isMobile: boolean } => {
    const platforms = getPlatforms();
    const [isMobile, setIsMobile] = useState<boolean>(false)
    useEffect(() => {
        setIsMobile(platforms.includes("mobile"))
    }, [])
    return { isMobile }
}

export default usePlatforms