import React, { useEffect } from 'react'
import MetamaskConnect from './MetamaskConnect';
import WalletDisplay from './WalletDisplay';

import semcoinLogo from '../../src/images/s-coin.png';

function Header({ isMobile, accounts, semcoinBalance, handleConnectWallet, handleDisconnect }) {

	useEffect(() => {

	}, [accounts]);

	return (
		<>
			<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
				<div className="container">
					<a className="navbar-brand" href="/"><i className="fa-solid fa-sign-hanging"></i> Message Board</a>
					{(!accounts || accounts.length === 0) && <MetamaskConnect isMobile={isMobile} handleConnectWallet={handleConnectWallet} />}
					{accounts && accounts.length > 0 && <WalletDisplay isMobile={isMobile} accounts={accounts} semcoinBalance={semcoinBalance} handleDisconnect={handleDisconnect} />}
				</div>
			</nav>
		</>
	)
}

export default Header;