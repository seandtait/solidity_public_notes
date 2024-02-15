import { useEffect, useRef, useState } from 'react';
import './App.css';

import Web3 from 'web3';
import axios from 'axios';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Views
import MessageBoard from './views/MessageBoard';

// Contracts
import SemcoinContractABI from './contracts/Semcoin.json';
import MessageBoardContractABI from './contracts/MessageBoard.json';
import CreateMessage from './components/CreateMessage';
import FilterMessages from './components/FilterMessages';

function App() {
	const { v4: uuidv4 } = require('uuid');
	const bigInt = require('big-integer');

	// Contract Addresses
	const semcoinContractAddress = '0x26Bd64ee209ef407AFE0333095c4d51e2CF25810';
	const messageBoardContractAddress = '0x1D3467a4B1207240e39afdA9EB603920847E3D15';

	const [web3, setWeb3] = useState(null);
	const [accounts, setAccounts] = useState(null);
	const [semcoinBalance, setSemcoinBalance] = useState(0);

	const [isOwner, setIsOwner] = useState(false);
	const [contractSemcoinBalance, setContractSemcoinBalance] = useState(null);

	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

	const [messages, setMessages] = useState([]);
	const [fetchedMessages, setFetchedMessages] = useState([]);
	const [filteredMessages, setFilteredMessages] = useState([]);
	const [messageOffset, setMessageOffset] = useState(0);
	const [messageCountPerPage, setMessageCountPerPage] = useState(10);

	const [filterMinTokens, setFilterMinTokens] = useState(0);
	const [filterMaxTokens, setFilterMaxTokens] = useState(0);
	const [filterUuid, setFilterUuid] = useState('');

	const [absoluteMaxTokens, setAbsoluteMaxTokens] = useState(0);

	const [totalCost, setTotalCost] = useState(0);
	const [tip, setTip] = useState(0);
	const [message, setMessage] = useState("");

	const onAccountsChanged = async (_accounts) => {
		if (_accounts.length === 0) {
			// Connect to metamask

		} else {
			setAccounts(_accounts);
		}
	};

	const onConnectWallet = async () => {
		if (window.ethereum) {
			try {
				const _accounts = await window.ethereum.request({
					method: 'eth_requestAccounts',
				});
				const _web3 = new Web3(window.ethereum);
				const messageBoardContract = new _web3.eth.Contract(MessageBoardContractABI.abi, messageBoardContractAddress);
				setIsOwner(await messageBoardContract.methods.isOwner().call({
					from: _accounts[0],
				}));
				setWeb3(_web3);
				onAccountsChanged(_accounts);
			} catch (error) {
				console.error(error);
			}
		} else {
			// Please install metamask

		}
	};

	const onDisconnect = () => {
		setAccounts(null);
	};

	async function updateBalances() {
		setSemcoinBalance(null);
		if (accounts && accounts.length > 0 && web3) {
			// Get semcoin tokens
			const semcoinContract = new web3.eth.Contract(SemcoinContractABI.abi, semcoinContractAddress);
			const semcoin = await semcoinContract.methods.balanceOf(accounts[0]).call();
			setSemcoinBalance(semcoin);
		}
	}

	async function updateIsOwner() {
		const messageBoardContract = new web3.eth.Contract(MessageBoardContractABI.abi, messageBoardContractAddress);
		setIsOwner(await messageBoardContract.methods.isOwner().call({
			from: accounts[0],
		}));

		if (isOwner) {
			// Fetch semcoin balance of contract
			const semcoinContract = new web3.eth.Contract(SemcoinContractABI.abi, semcoinContractAddress);
			const contractSemcoinPool = await semcoinContract.methods.balanceOf(messageBoardContractAddress).call();
			setContractSemcoinBalance(contractSemcoinPool.toString());
		} else {
			setContractSemcoinBalance(null);
		}
	}

	async function loadMessages() {
		try {
			// Get from DB
			const response = await axios.get(process.env.REACT_APP_SERVER_ENDPOINT + process.env.REACT_APP_GET_SUFFIX);
			setFetchedMessages(response.data);
		} catch (error) {
			console.error(error);
		}
	}

	const onCreateMessage = async () => {
		try {
			const uuid = uuidv4().toString();
			const date = Math.floor(Date.now() / 1000);

			const tokenCostPerByte = 1;
			const messageByteCost = utf8ByteLength(message);
			const totalCost = (messageByteCost * tokenCostPerByte) + tip;

			const semcoinContract = new web3.eth.Contract(SemcoinContractABI.abi, semcoinContractAddress);
			await semcoinContract.methods.approve(messageBoardContractAddress, totalCost).send({
				from: accounts[0],
			});

			const messageBoardContract = new web3.eth.Contract(MessageBoardContractABI.abi, messageBoardContractAddress);
			const tx = await messageBoardContract.methods.createMessage(uuid, date, tip, message).send({
				from: accounts[0],
				value: totalCost,
			});

			if (tx) {
				// Save to DB
				const response = await axios.post(process.env.REACT_APP_SERVER_ENDPOINT + process.env.REACT_APP_CREATE_SUFFIX, {
					uuid: uuid,
					date: date,
					senderAddress: accounts[0],
					tip: tip,
					message: message
				});
			}

			// Clean up
			await updateBalances();
			setTip(0);
			setMessage("");
			setTotalCost(0);

		} catch (error) {
			console.error(error);
		}
	}

	const onCalculateTotalCost = async (_message, _tip) => {
		const messageBoardContract = new web3.eth.Contract(MessageBoardContractABI.abi, messageBoardContractAddress);
		const tokenCostPerByte = Number(await messageBoardContract.methods.tokenCostPerByte().call());

		const messageByteLength = utf8ByteLength(_message);
		const _totalCost = (messageByteLength * tokenCostPerByte) + _tip;

		return _totalCost;
	}

	const onTipChange = async (currentTip, newTip) => {
		return newTip;
	}

	const onMessageChange = async (currentMessage, newMessage) => {
		const messageBoardContract = new web3.eth.Contract(MessageBoardContractABI.abi, messageBoardContractAddress);
		const messageByteLimit = await messageBoardContract.methods.messageByteLimit().call();

		if (utf8ByteLength(newMessage) > messageByteLimit) {
			return currentMessage;
		}

		return newMessage;
	}

	function utf8ByteLength(str) {
		// Encode string as UTF-8 and get the byte length of the result
		var utf8Str = unescape(encodeURIComponent(str));
		return utf8Str.length;
	}

	const onFilter = (min, max, uuid) => {
		let _messages = messages;

		if (!isNaN(min))
			_messages = _messages.filter(m => bigInt(m.tip) >= bigInt(min));
		if (!isNaN(max))
			_messages = _messages.filter(m => bigInt(m.tip) <= bigInt(max));

		if (uuid) {
			_messages = _messages.filter(m => {
				let regex = new RegExp(uuid, "i");
				return regex.test(m.uuid);
			});
		}

		setFilteredMessages(_messages);
	}

	async function getAbsoluteMaxTokens() {
		// Get from DB
		const response = await axios.get(process.env.REACT_APP_SERVER_ENDPOINT + process.env.REACT_APP_GET_SUFFIX);

		const _absoluteMaxTokens = Math.max(...response.data.map(m => bigInt(m.tip)));
		setAbsoluteMaxTokens(_absoluteMaxTokens);
		return _absoluteMaxTokens;
	}

	useEffect(() => {
		async function getAbsMaxTokens() {
			const _absoluteMaxTokens = await getAbsoluteMaxTokens();
			setFilterMaxTokens(_absoluteMaxTokens);
		}
		getAbsMaxTokens();

		let interval;
		function getMessages() {
			interval = setInterval(loadMessages, 1000);
		}

		getMessages();

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (messages !== fetchedMessages) {
			setMessages(fetchedMessages);
		}

		async function getAbsMaxTokens() {
			await getAbsoluteMaxTokens();
		}
		getAbsMaxTokens();
	}, [fetchedMessages]);

	useEffect(() => {
		onFilter(filterMinTokens, filterMaxTokens, filterUuid);
	}, [messages]);

	useEffect(() => {
		if (window.ethereum) {
			window.ethereum.on('accountsChanged', onAccountsChanged);
		}

		updateBalances();

		if (web3 && accounts) {
			updateIsOwner();
		} else {
			setIsOwner(false);
		}

		function handleResize() {
			setIsMobile(window.innerWidth < 990);
		}

		window.addEventListener('resize', handleResize);

		return () => {
			if (window.ethereum) {
				window.ethereum.removeListener('accountsChanged', onAccountsChanged);
			}
			window.removeEventListener('resize', handleResize);
		}
	}, [accounts, web3, isOwner]);

	return (
		<div className="App">
			<div className='vh-100'>
				<div className="h-100 d-flex flex-column">
					<Header isMobile={isMobile} accounts={accounts} semcoinBalance={semcoinBalance} handleConnectWallet={onConnectWallet} handleDisconnect={onDisconnect} />

					<div className="container h-100 d-flex flex-column flex-grow-1">
						<div className="row">
							<div className="col-3">
								<FilterMessages
									isMobile={isMobile}
									filterMinTokens={filterMinTokens}
									filterMaxTokens={filterMaxTokens}
									filterUuid={filterUuid}
									setFilterMinTokens={setFilterMinTokens}
									setFilterMaxTokens={setFilterMaxTokens}
									setFilterUuid={setFilterUuid}
									handleFilter={onFilter}
									absoluteMaxTokens={absoluteMaxTokens}
								/>
							</div>
							<div className="col-6">
								<MessageBoard isMobile={isMobile} messages={filteredMessages} />
							</div>
							<div className="col-3">
								{accounts && accounts.length > 0 &&
									<CreateMessage
										handleTipChange={onTipChange}
										handleMessageChange={onMessageChange}
										handleCalculateTotalCost={onCalculateTotalCost}
										semcoinBalance={semcoinBalance}
										handleCreateMessage={onCreateMessage}
										tip={tip}
										message={message}
										totalCost={totalCost}
										setTip={setTip}
										setMessage={setMessage}
										setTotalCost={setTotalCost}
									/>}
							</div>
						</div>
						<div className='flex-grow-1'><span></span></div>
						{/* {isOwner && <Banner isMobile={isMobile} web3={web3} handleWithdrawFeePot={onWithdrawFeePot} ethPoolBalance={ethPoolBalance} feePotBalance={feePotBalance} />} */}
						<Footer />
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
