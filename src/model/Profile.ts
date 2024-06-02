
type Profile = {
    name: string;
    email: string;
    didId: string;
    keyStorage: Map<string, any>;
    roles: string[];
}

export default Profile;