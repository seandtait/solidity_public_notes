// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MessageBoard {
    // Contracts
    address public semcoinAddress; // The contract address of Semcoin

    // Retrieval
    // uint public messageLimit = 10;

    // Creation
    // uuid, date, sender address, tip, message
    uint public messageByteLimit = 100;
    uint public tokenCostPerByte = 1;
    string private messageSpacer = "||";

    event MessageCreated(
        string uuid,
        uint256 date,
        address indexed account,
        uint256 tip,
        string message
    );

    constructor(address _semcoinAddress) {
        owner = msg.sender;
        semcoinAddress = _semcoinAddress;
    }

    // Ownership
    address owner;

    function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }

    // Message Board
    mapping(string => string) public mappedMessages;

    function getMessageByUuid(
        string memory uuid
    ) public view returns (string memory) {
        return mappedMessages[uuid];
    }

    // function getMessages(
    //     uint start,
    //     uint quantity
    // ) public view returns (string[] memory) {
    //     require(
    //         quantity <= messageLimit,
    //         "Trying to fetch too many messages at once."
    //     );
    //     string[] memory fetchMessages = new string[](quantity);
    //     for (uint i = 0; i < quantity; i++) {
    //         fetchMessages[i] = messageStrings[start + i];
    //     }
    //     return fetchMessages;
    // }

    // Creating Messages
    function createMessage(
        string memory uuid,
        uint256 date,
        uint256 tip,
        string memory message // the original message,
    ) public payable {
        // Make sure they are within the limits
        uint messageByteLength = byteLengthOfString(message);
        require(
            messageByteLength <= messageByteLimit,
            "Your message is bigger than the 100 byte length limit!"
        );

        require(isWithinOneHour(date), "Timestamp is not acceptable.");

        // Make sure they have paid enough tokens
        // message length + tip amount
        uint256 totalCost = (messageByteLength * tokenCostPerByte) + tip;

        require(
            msg.value == totalCost,
            "The value sent does not equal the byte length of the message plus your tip."
        );

        require(
            IERC20(semcoinAddress).transferFrom(
                msg.sender,
                address(this),
                totalCost
            ),
            "Could not transfer payment from sender to this contract."
        );

        mappedMessages[uuid] = concatenateInputs(uuid, date, tip, message);
        emit MessageCreated(uuid, date, msg.sender, tip, message);
    }

    function concatenateInputs(
        string memory uuid,
        uint256 date,
        uint256 tip,
        string memory message
    ) internal view returns (string memory) {
        // Convert bytes32 to string
        string memory addressStr = addressToString(msg.sender);
        string memory dateStr = uintToString(date);
        // Convert uint256 to string
        string memory tipStr = uintToString(tip);

        // Concatenate the strings
        return
            string(
                abi.encodePacked(
                    uuid,
                    messageSpacer,
                    dateStr,
                    messageSpacer,
                    addressStr,
                    messageSpacer,
                    tipStr,
                    messageSpacer,
                    message
                )
            );
    }

    function uintToString(uint256 _uint) internal pure returns (string memory) {
        if (_uint == 0) {
            return "0";
        }
        uint256 temp = _uint;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (_uint != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + (_uint % 10)));
            _uint /= 10;
        }
        return string(buffer);
    }

    function addressToString(
        address _addr
    ) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42); // Length of an Ethereum address string

        str[0] = "0";
        str[1] = "x";

        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }

        return string(str);
    }

    uint constant ONE_HOUR = 60 * 60; // 3600 seconds

    function isWithinOneHour(uint timestamp) public view returns (bool) {
        uint currentTime = block.timestamp;

        // Check if the given timestamp is within one hour of the current time
        if (timestamp >= currentTime && timestamp - currentTime <= ONE_HOUR) {
            return true; // The given timestamp is within the next hour
        } else if (
            timestamp < currentTime && currentTime - timestamp <= ONE_HOUR
        ) {
            return true; // The given timestamp was within the last hour
        }
        return false; // The given timestamp is not within one hour of the current time
    }

    function byteLengthOfString(string memory str) private pure returns (uint) {
        return bytes(str).length;
    }
}
