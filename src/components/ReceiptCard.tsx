import React from 'react'
import styled from 'styled-components'
import Receta from '../model/Receta'
import ProfileButton from './ProfileButton'
import Button from './Button'

interface ReceiptCardTypes {
    receipt: Receta
}

const ReceiptCard: React.FC<ReceiptCardTypes> = ({ receipt }) => {
    return (
        <ReceiptCardStyled>
            <div className='receipt-card-header'>
                <ProfileButton name={receipt.nombrePaciente || ""} />
                <div className='recepit-header-title'>
                    <p className='pac-name'>{receipt.nombrePaciente}</p>
                    <p className='receipt-card-light-text'>
                        {new Date(receipt.fechaEmision).toLocaleString('es', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                    </p>
                </div>
            </div>
            <div className='receipt-card-content scrollbarNone'>
                <p className='receipt-card-light-text'>{"Prescripción"}</p>
                {receipt.medicamentos.map((m, i) =>
                    <div className='receipt-card-content-med' key={`${i}-${m}`}>
                        <div className='dot'></div>
                        <p>{m}</p>
                    </div>
                )
                }
            </div>
            <div className='receipt-card-footer'>
                <Button label='Ver Receta' />
            </div>
        </ReceiptCardStyled>
    )
}

export default ReceiptCard

const ReceiptCardStyled = styled.div`
    width: 20em;
    background: #fff;
    border-radius: 5px;
    box-shadow: 0px 0px 20px -3px rgba(189,189,189,1);
    .receipt-card-header{
        padding: 1em;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1em;
        .recepit-header-title{
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            .pac-name{
                color: #000;
                font-size: 1.2em;
                font-weight: 500;
            }
            
        }
    }
    .receipt-card-light-text{
        color: #000;
        opacity: .5;
        font-size: 0.9em;
        font-weight: 400;
    }
    .receipt-card-content{
        background: #FAFAFA;
        padding: 1em;
        height: 15em;
        overflow-y: scroll;
        .receipt-card-content-med{
            display: flex;
            justify-content: flex-start;
            align-items: center;
            padding: 1em 0 0 1em;
            gap: 1em;
            .dot{
                width: 0.4em;
                height: 0.4em;
                background: #000;
                border-radius: 100%;
            }
            p{
                color: #000;
                font-size: 1.2em;
                font-weight: 400;
            }
        }

    }
    .receipt-card-footer{
        padding: 1em;
    }

`