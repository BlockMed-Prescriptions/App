import React from "react";
import styled from "styled-components";

interface ShowHashTypes {
    hash: string;
    label?: string;
    noAction?: boolean;
}

const ShowHash: React.FC<ShowHashTypes> = ({ hash, label, noAction }) => {
    return (
        <ShowHashStyled noaction={noAction}>
            <p>
                {label ? label : ""}
                <span
                    onClick={() => {
                        if (!!noAction) return
                        window.open(`https://explorer.zksync.io/tx/${hash}`, "_blank");
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
