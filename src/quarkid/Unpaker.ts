import { DIDCommPackedMessage } from "@quarkid/kms-core";
import Profile from "../model/Profile";
import { buildKms } from "../service/KmsFactory";


export const Unpack = async (profile: Profile, message: DIDCommPackedMessage) => {
    const kms = await buildKms(profile);
    try {
        const unpacked = await kms.unpackvDIDCommV2(profile.didId!, message);
        return unpacked;
    } catch (e) {
        console.error("Hubo un error al desempaquetar el siguiente mensaje", message, e)
        throw e
    }
}