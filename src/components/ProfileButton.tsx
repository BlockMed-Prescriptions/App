import React from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'

interface ProfileButtonTypes {
    to?: string,
    name: string
}

const ProfileButton: React.FC<ProfileButtonTypes> = ({ to, name }) => {
    const history = useHistory();

    const buttonProfileLabel = () => {
        const haveWitheSpace = /\s/g.test(name)
        if (haveWitheSpace) {
            const nameSplited = name?.split(" ")
            return nameSplited[0].slice(0, 1)?.toUpperCase() + nameSplited[1].slice(0, 1)?.toUpperCase()
        }
        if (!haveWitheSpace)
            return name.slice(0, 1)?.toUpperCase() + name.slice(1, 2)?.toUpperCase()
    }
    return (
        <ProfileButtonStyled to={to} onClick={() => to ? history.push(to) : {}}>
            <p>{buttonProfileLabel()}</p>
        </ProfileButtonStyled>
    )
}

export default ProfileButton

const ProfileButtonStyled = styled.div<{ to?: string }>`
        width: fit-content;
        ${p => p.to ? "cursor: pointer;" : "cursor: default;"}
        background-color: var(--ion-color-light);
        padding: 0.8em;
        border-radius: 100px;
        border: 1px solid var(--ion-color-primary);
        display: flex;
        justify-content: center;
        align-items: center;

        ${p => !p.to ? "font-size: 0.8em;" : ""}
        ${p => p.to ? `
        @media (max-width:500px){
            font-size: 0.7em ;
        }
        @media (min-width:500px){
            font-size: 0.9em;
        }
        ` : ""}
        p{
            color: var(--ion-color-primary);
            margin: 0;
        }
`