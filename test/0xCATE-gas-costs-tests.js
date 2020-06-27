const ERC20Token = artifacts.require("./ERC20Token.sol");
const CateToken_v2 = artifacts.require("./_0xCatetherToken.sol");
const CateToken_v2_mock = artifacts.require("./_0xCatetherToken_mock");
//const assert = require("chai").assert;
//const truffleAssert = require('truffle-assertions');

//const common = require("./common.js");
const TEST_TAG = '0xCATE gas-costs - ';

const tokenSymbol = "0xCATE";
const tokenName = "0xCatether Token";
const tokenDecimals = 4;
const deprecatedContractAddress = '0x8F7DbF90E71285552a687097220E1035C2e87639';
const _totalSupply = 0;
const epochCount = 15516;
const _MAXIMUM_TARGET = '0x0000000100000000000000000000000000000000000000000000000000000000'; //2**224
const _MINIMUM_TARGET = '0x0000000000000000000000000000000000000000000000000000000000010000'; //2**16
let ownerTokens = 500000000;



//contract(common.TEST_CONTRACT_NAME, async accounts => {
contract("0xCATE tests", async accounts => {
	var tokenInstance;
	var ci;
	var ci_mock;
	let contractOwner = accounts[0];
	let admin1 = accounts[1];
	let admin2 = accounts[2];
	let user1 = accounts[3];
	let user2 = accounts[4];
	
	
	
	// 'beforeEach' function will run before each test creating a new instance of the contract each time
	beforeEach('setup contract for each test', async () => {
		//tokenInstance = await ERC20Token.new(ownerTokens, {from: contractOwner});
		//ci = await CateToken_v2.new({from: contractOwner});
		//ci_mock = await CateToken_v2_mock.new(tokenInstance.address, {from: contractOwner});
		
		tokenInstance = await ERC20Token.deployed();
		ci = await CateToken_v2.deployed();
		ci_mock = await CateToken_v2_mock.deployed();
    });
	
	
	
	it(TEST_TAG + 'check gas and run "mint" function', async () => {
		// gasPrice returns the gas price on the current network
		var gasPrice;
		try {
			//gasPrice = Number(await web3.eth.gasPrice);
			gasPrice = web3.eth.gasPrice;
		} catch (error) {
			console.log("***gasPrice err: " + error.message);
        }
		
		console.log("Gas Price is " + gasPrice + " wei"); // "10000000000000"
		
		// 'estimateGas' after the function name to get gas estimation for this particular function
		//mint(uint256 nonce, bytes32 challenge_digest)
		let sender1 = '0x439a0F5438C0042E1E3fDa90343d97A87A9DAcC9';
		let nonce = '417a6c6568726961eb6347a2f43c870c010000002dcc3bf6dd53201841099fff';
		nonce = web3.utils.toBN(nonce); //works
		let challenge_digest_bytes32 = (new String('0x00000000f022dd9ad5d102aebc08a8d1a04ea51e20b6322369bce87ba0a43e3f')).valueOf();
		
		let res;
		let gas;
		
		res = await ci.mint.estimateGas(nonce, challenge_digest_bytes32, {from: sender1});
		gas = Number(res);
		
		/// gas is about 242851 units for 'mint' function
		console.log("***0xCATE_v2 test***");
		console.log("estimated transaction gas = " + gas + " units");
		console.log("gas price = " + gasPrice + " units");
        console.log("gas cost estimation = " + (gas * gasPrice) + " wei");
        //console.log("gas cost estimation = " + web3.utils.fromWei(web3.utils.toBN(gas * gasPrice), 'ether') + " ether");
		
		
		
		res = await ci_mock.mint_opt.estimateGas(sender1, nonce, challenge_digest_bytes32); //, {from: sender1});
		gas = Number(res);
		
		/// gas is about 246151 units for mock 'mint' function
		console.log("***0xCATE_v2 MOCK test***");
		console.log("estimated transaction gas = " + gas + " units");
		console.log("gas price = " + gasPrice + " units");
        console.log("gas cost estimation = " + (gas * gasPrice) + " wei");
        //console.log("gas cost estimation = " + web3.utils.fromWei(web3.utils.toBN(gas * gasPrice), 'ether') + " ether");
		
		let cNumber;
		
		cNumber = await ci.getChallengeNumber.call();
		console.log(`ci challengeNumber: ${cNumber}`);
		
		cNumber = await ci_mock.getChallengeNumber.call();
		console.log(`ci_mock challengeNumber: ${cNumber}`);
		
		// finally test executing a valid mining operation that failed on chain due to 'out of gas' error
		let tx;
		let gasUsed;
		try {
			//this will fail since sender1 is not an address part of ganache in local blockchain
			tx = await ci.mint(nonce, challenge_digest_bytes32, {from: sender1});
			gasUsed = tx.receipt.gasUsed;
			console.log(`ci.mint GasUsed: ${gasUsed}`);
		} catch (error) {
			console.log("***ci.mint err: " + error.message);
        }
		
		try {
			tx = await ci_mock.mint_opt(sender1, nonce, challenge_digest_bytes32); //, {from: sender1});
			gasUsed = tx.receipt.gasUsed;
			console.log(`ci_mock.mint_opt GasUsed: ${gasUsed}`);
		} catch (error) {
			console.log("***ci_mock.mint_opt err: " + error.message);
        }
		
		// get gasPrice from the transaction
		const tx1 = await web3.eth.getTransaction(tx.tx);
		gasPrice = tx1.gasPrice;
		console.log(`GasPrice from tx: ${gasPrice}`);
		
		
		
		// trying for second time should fail since challenge number has been changed
		cNumber = await ci_mock.getChallengeNumber.call();
		console.log(`ci_mock challengeNumber: ${cNumber}`);
		
		try {
			tx = await ci_mock.mint_opt(sender1, nonce, challenge_digest_bytes32); //, {from: sender1});
			assert.fail();
			//gasUsed = tx.receipt.gasUsed;
			//console.log(`ci_mock.mint_opt GasUsed: ${gasUsed}`);
		} catch (error) {
			console.log("***ci_mock.mint_opt err: " + error.message);
			assert(error.message.indexOf('revert') >= 0, 'ci_mock.mint_opt error message must contain revert');
        }
    });
	
})
