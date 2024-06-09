import { Suite } from '@quarkid/kms-core';
import Profile from '../model/Profile';

class ProfileHandler {
    public static isMedico(profile: Profile): boolean {
        return profile.roles.includes('med');
    }

    public static getBbsbls2020Key(profile: Profile): any {
        for (const [key, value] of Object.entries(profile.keyStorage)) {
            if (value.suite === Suite.Bbsbls2020) {
                return value;
            }
        }
        return null
    }
}

export default ProfileHandler;
