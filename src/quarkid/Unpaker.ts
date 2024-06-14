import { DIDCommPackedMessage } from "@quarkid/kms-core";
import Profile from "../model/Profile";
import { buildKms } from "../service/KmsFactory";


export const Unpack = async (profile: Profile, message: DIDCommPackedMessage) => {
    const kms = await buildKms(profile);
    const unpacked = await kms.unpackvDIDCommV2(profile.didId!, message);
    return unpacked;
}