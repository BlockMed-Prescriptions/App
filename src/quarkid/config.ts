

export const config = {
    'serviceEndpoint': import.meta.env.VITE_APP_QUARKID_SERVICE_ENDPOINT || 'http://localhost:3000',
    'proxyEndpoint': import.meta.env.VITE_APP_QUARKID_PROXY_ENDPOINT || 'http://localhost:3000',
    'didMethod': import.meta.env.VITE_APP_QUARKID_DID_METHOD || 'did:quarkid',
    'recetasbcEndpoint': import.meta.env.VITE_APP_RECETASBC_PROXY_ENDPOINT || 'http://localhost:3000',
}
