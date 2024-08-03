import React from 'react'
import styled from 'styled-components'
import Receta from '../model/Receta'
import ShowCertificate from './ShowCertificate'

interface ReceiptCertificatesTypes {
  receipt: Receta | null
}

const ReceiptCertificates: React.FC<ReceiptCertificatesTypes> = ({ receipt }) => {
  return (
    <ReceiptCertificateStyled>
      {!!receipt?.certificado &&
        <ShowCertificate
          certificate={receipt?.certificado}
          text="CERTIFICADO EMICION"
          modalTitle="Emicion"
        />
      }
      {!!receipt?.dispensa?.certificado && (
        <ShowCertificate
          certificate={receipt?.dispensa?.certificado}
          text="CERTIFICADO DISPENSA"
          modalTitle="Dispensa"
        />
      )}
      {!!receipt?.recepcion?.certificado && (
        <ShowCertificate
          certificate={receipt?.recepcion?.certificado}
          text="CERTIFICADO RECEPCION"
          modalTitle="Recepcion"
        />
      )}
    </ReceiptCertificateStyled>
  )
}

export default ReceiptCertificates

const ReceiptCertificateStyled = styled.div`
      display: flex;
      align-items: center;
      width: fit-content !important;
      
      @media (max-width:500px){
        flex-direction: column;
        gap: .5em;
      }
      @media (min-width:500px){
        gap: 1em;
      }
`