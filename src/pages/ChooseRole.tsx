import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Button from "../components/Button";
import Logo from "../components/Logo";
import RecetaBcData from "../service/RecetaBcData";
import { useHistory } from "react-router";
import Profile from "../model/Profile";
import Radio from "../components/Radio";
import { ROLES } from "./CreateUser";

const initRolesWithProfiles = {
    pac: null,
    med: null,
    far: null,
};

type Role = "pac" | "med" | "far"

const ROLE_REDIRECT: { [ke in Role]: string } = {
    pac: "/receipts?type=my",
    med: "/receipts?type=emit",
    far: "/receipts?type=pending",
}

const ChooseRole: React.FC = () => {
    const data = RecetaBcData.getInstance();
    const [user, setUser] = useState<Role | null>(null);
    const [rolesWithProfiles, setRolesWithProfiles] = useState<{
        [k: string]: Profile | null;
    }>(initRolesWithProfiles);
    const history = useHistory();

    useEffect(() => {
        data.getProfiles().then((profiles) => {
            for (let o of Object.keys(rolesWithProfiles)) {
                const findProfile =
                    profiles.find((item) => item.roles.includes(o as Role)) || null;
                setRolesWithProfiles((prev) => ({ ...prev, [o]: findProfile }));
                if (findProfile) {
                    setUser(prev => !!prev ? prev : o as Role)
                }
            }
        });
    }, [data.currentProfile]);
    return (
        <ChooseRoleStyled>
            <div className="container">
                <Logo name />
                <Radio
                    value={user || ""}
                    options={Object.keys(rolesWithProfiles).map((item) => ({
                        id: item,
                        label: `${ROLES[item]}${rolesWithProfiles[item]?.name
                            ? `: ${rolesWithProfiles[item]?.name}`
                            : ""
                            } `,
                    }))}
                    onChange={(v) => setUser(v as Role)}
                />
                <Button
                    onClick={async () => {
                        if (!user) return;
                        if (!!rolesWithProfiles[user || ""]) {
                            data.setCurrentProfile(rolesWithProfiles[user]);
                            history.push(ROLE_REDIRECT[user]);
                            return;
                        }
                        await data.saveUserRole({ role: user });
                        history.push("/init");
                    }}
                    label="Continuar"
                    size="1.3em"
                    padding="0.8em 3.5em 0.8em 3.5em"
                />
            </div>
        </ChooseRoleStyled>
    );
};

export default ChooseRole;

const ChooseRoleStyled = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--ion-color-light);

  .container {
    @media (max-width:500px){
        padding: 1em;
        width: 100%;
        background-color: transparent;
        box-shadow: none;
    }
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 9px 9px 43px -3px rgba(189,189,189,1);
    padding: 1em 0.5em 1em 0.5em;
    max-width: 25em;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 2em;
  }
`;
