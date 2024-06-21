import { Suite } from '@quarkid/kms-core';
import Profile from '../model/Profile';

class ProfileHandler {
    public static isMedico(profile: Profile): boolean {
        return profile.roles.includes('med');
    }

    public static isPaciente(profile: Profile): boolean {
        return profile.roles.includes('pac');
    }

    public static isFarmacia(profile: Profile): boolean {
        return profile.roles.includes('far');
    }

    public static getBbsbls2020Key(profile: Profile): any {
        for (const [key, value] of Object.entries(profile.keyStorage)) {
            if (value.suite === Suite.Bbsbls2020) {
                return value;
            }
        }
        return null
    }

    public static toQrCode(profile: Profile): string {
        return JSON.stringify({
            "did": profile.didId,
            "name": profile.name,
            "roles": profile.roles,
        })
    }

    public static fromQrCode(qrCode: string): Profile|null {
        const obj = JSON.parse(qrCode);
        if (!obj.did || !obj.name || !obj.roles) {
            return null;
        }
        return {
            didId: obj.did,
            name: obj.name,
            roles: obj.roles,
            keyStorage: {},
            email: "",
            seed: ""
        }
    }
}

export default ProfileHandler;
