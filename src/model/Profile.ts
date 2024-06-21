
type Profile = {
    name: string;
    email: string;
    didId: string;
    keyStorage: {[key: string]: any};
    roles: string[];
    seed: string;
}

export default Profile;