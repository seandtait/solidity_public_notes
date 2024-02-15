const Migrations = artifacts.require("Migrations");
const MessageBoard = artifacts.require("MessageBoard");

module.exports = function (deployer) {
	deployer.deploy(Migrations);

	const semcoinAddress = '0x26Bd64ee209ef407AFE0333095c4d51e2CF25810';
	deployer.deploy(MessageBoard, semcoinAddress);

};
