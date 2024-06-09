import { VerifiableCredential } from "@quarkid/vc-core";
import Profile from "../model/Profile";
import { Suite } from "@quarkid/kms-core";
import { AssertionMethodPurpose } from "@quarkid/did-core";
import { buildKms } from "../service/KmsFactory";

export const CredentialSigner = async (credential: VerifiableCredential, profile: Profile) => {
    const kms = await buildKms(profile);

    const didEmisor = profile.didId;
    const bbsbls2020 = await kms.getPublicKeysBySuiteType(Suite.RsaSignature2018)

    if (!bbsbls2020) {
        throw new Error("No se encontró la clave privada RsaSignature2018.")
    }

    const vc = await kms.signVC(
        Suite.RsaSignature2018,
        bbsbls2020[0],
        credential,
        didEmisor,
        didEmisor + "#bbsbls",
        new AssertionMethodPurpose()
      );
  
    return vc;
}