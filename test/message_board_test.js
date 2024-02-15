const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider);

const SemcoinContractABI = require('../build/contracts/Semcoin.json');
const SembankContractABI = require('../build/contracts/Sembank.json');

const sembankAddress = '0x8dD0B28Fbc513fdC4c2214Bcb6f8E8542710308c';

const MessageBoard = artifacts.require("MessageBoard");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Deployment Test", function (/* accounts */) {
	it("should assert true", async function () {
		await MessageBoard.deployed();
		return assert.isTrue(true);
	});
});

contract("Ownership", accounts => {
	it("Should first return true then false.", async () => {
		const messageBoardInstance = await MessageBoard.deployed();
		// True
		let userAccount = accounts[0];
		const isOwnerFirst = await messageBoardInstance.isOwner({ from: userAccount });
		assert.equal(isOwnerFirst, true, "Result is not as expected.");

		// False
		userAccount = accounts[1];
		const isOwnerSecond = await messageBoardInstance.isOwner({ from: userAccount });
		assert.equal(isOwnerSecond, false, "Result is not as expected.");

	})
});

contract("Create and Read Messages", accounts => {
	it("Should create a message and then read it successfully.", async () => {
		// Setup
		const messageBoardInstance = await MessageBoard.deployed();
		const tokenCostPerByte = await messageBoardInstance.tokenCostPerByte();
		const semcoinContractAddress = await messageBoardInstance.semcoinAddress();
		const userAccount = accounts[1];

		const semcoinInstance = await new web3.eth.Contract(SemcoinContractABI.abi, semcoinContractAddress);
		const sembankInstance = await new web3.eth.Contract(SembankContractABI.abi, sembankAddress);

		// Need some semcoin to do the tx
		sembankInstance.methods.deposit().send({
			from: userAccount,
			value: web3.utils.toWei("1", "ether"),
		});

		// Create the message
		const uuid = '0abe7ba3-0f68-429e-a7e5-129d8723271f';
		const date = Math.floor(Date.now() / 1000);
		const tip = 10;
		const message = "Hello world";
		const messageByteLength = utf8ByteLength(message);
		const totalCost = messageByteLength * tokenCostPerByte + tip;
		const stringSeparator = "||";

		// console.log(uuid);
		// console.log(date);
		// console.log(userAccount);
		// console.log(tip);
		// console.log(message);

		// console.log('byte length');
		// console.log(messageByteLength);
		// console.log(`Cost should be: ${messageByteLength * tokenCostPerByte} for the message cost + ${tip} tip. Total: ${totalCost} `);

		await semcoinInstance.methods.approve(messageBoardInstance.address, totalCost).send({
			from: userAccount,
		});

		await messageBoardInstance.createMessage(uuid, date, tip, message, {
			from: userAccount,
			value: totalCost,
		});

		// Read the message now
		const returnMessage = await messageBoardInstance.getMessageByUuid(uuid);
		const expectedReturnMessage = uuid + stringSeparator + date + stringSeparator + userAccount.toString().toLowerCase() + stringSeparator + tip.toString() + stringSeparator + message;
		assert.equal(returnMessage, expectedReturnMessage, "The return message was not as expected.");
	})

	// function getDate() {
	// 	const currentDate = new Date();
	// 	const formattedData = currentDate.getFullYear() + '-' +
	// 		(currentDate.getMonth() + 1) + '-' +
	// 		currentDate.getDate() + ' ' +
	// 		currentDate.getHours() + ':' +
	// 		currentDate.getMinutes() + ':' +
	// 		currentDate.getSeconds();
	// 	return formattedData;
	// }

	function utf8ByteLength(str) {
		// Encode string as UTF-8 and get the byte length of the result
		var utf8Str = unescape(encodeURIComponent(str));
		return utf8Str.length;
	}

});

