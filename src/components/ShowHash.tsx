import React from "react";
import styled from "styled-components";

interface ShowHashTypes {
    hash: string;
    label?: string;
    noAction?: boolean;
    url?: keyof URLSTypes
}

interface URLSTypes {
    sepolia: string;
    explorer: string
}

const URLS: URLSTypes = {
    sepolia: "https://sepolia.explorer.zksync.io/tx/",
    explorer: "https://explorer.zksync.io/tx/"
}

const ShowHash: React.FC<ShowHashTypes> = ({ hash, label, noAction, url }) => {

    if (!hash) return <></>
    return (
        <ShowHashStyled noaction={noAction}>
            <p>
                {label ? label : ""}
                <span
                    onClick={() => {
                        if (!!noAction) return
                        window.open(`${URLS[url || "explorer"]}${hash}`, "_blank");
                    }}
                >
                    {hash}
                </span>
            </p>
        </ShowHashStyled>
    );
};

export default ShowHash;

const ShowHashStyled = styled.div<{ noaction?: boolean }>`
width: 100%;
  p {
    color: #000;
    opacity: 0.5;
    font-size: 0.8em;
    margin: 0;
    width: 100%;
    span {
      ${p => p.noaction ? "" : `
      text-decoration: underline;
      cursor: pointer;
      `}
    }
  }
`;
