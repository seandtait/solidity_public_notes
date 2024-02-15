import React from 'react'

function MetamaskConnect({ isMobile, handleConnectWallet }) {
    return (
        <>
            {isMobile && (
                <button style={{ height: '80%' }} onClick={() => handleConnectWallet()} className="btn btn-semcoin" type='button'><i className="fa-solid fa-wallet"></i> Connect</button>
            )}

            {!isMobile && (
                <button style={{ height: '80%' }} onClick={() => handleConnectWallet()} className="btn btn-semcoin" type='button'><i className="fa-solid fa-wallet"></i> Connect To Metamask</button>
            )}
        </>
    )
}

export default MetamaskConnect;