const ERC20Token = artifacts.require("./ERC20Token.sol");
const CateToken_v2 = artifacts.require("./_0xCatetherToken.sol");
//const assert = require("chai").assert;
//const truffleAssert = require('truffle-assertions');

//const common = require("./common.js");
const TEST_TAG = '0xCATE init - ';

const tokenSymbol = "0xCATE";
const tokenName = "0xCatether Token";
const tokenDecimals = 4;
const deprecatedContractAddress = '0x8F7DbF90E71285552a687097220E1035C2e87639';
const _totalSupply = 0;
const epochCount = 15516;
const _MAXIMUM_TARGET = '0x0000000100000000000000000000000000000000000000000000000000000000'; //2**224
const _MINIMUM_TARGET = '0x0000000000000000000000000000000000000000000000000000000000010000'; //2**16



//contract(common.TEST_CONTRACT_NAME, async accounts => {
contract("0xCATE tests", async accounts => {
	var tokenInstance;
	var CateInstance;
	let contractOwner = accounts[0];
	let admin1 = accounts[1];
	let admin2 = accounts[2];
	let user1 = accounts[3];
	let user2 = accounts[4];
	
	
	
	// 'beforeEach' function will run before each test creating a new instance of the contract each time
	beforeEach('setup contract for each test', async () => {
		tokenInstance = await ERC20Token.deployed();
		CateInstance = await CateToken_v2.deployed();
    });
	
	
	
	it(TEST_TAG + 'contract has the correct token symbol upon deployment', async () => {
		assert.equal(await CateInstance.symbol(), tokenSymbol, 'contract should have the correct token symbol upon deployment');
	});
	
	it(TEST_TAG + 'contract has the correct token name upon deployment', async () => {
		assert.equal(await CateInstance.name(), tokenName, 'contract should have the correct token name upon deployment');
	});
	
	it(TEST_TAG + 'contract has the correct token decimals upon deployment', async () => {
		assert.equal(await CateInstance.decimals(), tokenDecimals, 'contract should have the correct token decimals upon deployment');
	});
	
	it(TEST_TAG + 'contract has the correct token deprecated contract address upon deployment', async () => {
		assert.equal(await CateInstance.deprecatedContractAddress(), deprecatedContractAddress, 'contract should have the correct deprecated contract address upon deployment');
	});
	
	it(TEST_TAG + 'contract has the correct token total supply upon deployment', async () => {
		assert.equal(await CateInstance._totalSupply(), _totalSupply, 'contract should have the correct token total supply upon deployment');
	});
	
	it(TEST_TAG + 'contract has the correct token epoch count upon deployment', async () => {
		assert.equal(await CateInstance.epochCount(), epochCount, 'contract should have the correct token epoch count upon deployment');
	});
	
	it(TEST_TAG + 'contract has the correct token _MINIMUM_TARGET upon deployment', async () => {
		let minTargetRet = await CateInstance._MINIMUM_TARGET();
		let minimumTargetRet = web3.utils.toBN(minTargetRet).toString(16);
		let expectMinTarget = web3.utils.toBN(_MINIMUM_TARGET).toString(16);
		console.log('***minimumTargetRet: 0x' + minimumTargetRet);
		console.log('***expectMinTarget:  0x' + expectMinTarget);
		assert.equal(minimumTargetRet, expectMinTarget, 'contract should have the correct token _MINIMUM_TARGET upon deployment');
		
		//using web3.eth.abi.encodeParameter => NOT working
		//let minimumTargetRet2 = web3.eth.abi.encodeParameter('uint256', minTargetRet).toString();
		//let expectMinTarget2 = web3.eth.abi.encodeParameter('uint256', _MINIMUM_TARGET).toString();
		//console.log('***minimumTargetRet2: ' + minimumTargetRet2);
		//console.log('***expectMinTarget2: ' + expectMinTarget2);
		//assert.equal(minimumTargetRet2, expectMinTarget2, 'contract should have the correct token _MINIMUM_TARGET upon deployment');
	});
	
	it(TEST_TAG + 'contract has the correct token _MAXIMUM_TARGET upon deployment', async () => {
		let maxTargetRet = await CateInstance._MAXIMUM_TARGET();
		let maximumTargetRet = web3.utils.toBN(maxTargetRet).toString(16);
		let expectMaxTarget = web3.utils.toBN(_MAXIMUM_TARGET).toString(16);
		console.log('***maximumTargetRet: 0x' + maximumTargetRet);
		console.log('***expectMaxTarget:  0x' + expectMaxTarget);
		assert.equal(maximumTargetRet, expectMaxTarget, 'contract should have the correct token _MAXIMUM_TARGET upon deployment');
	});
	
	it(TEST_TAG + 'contract has the correct token target epoch for epoch count upon deployment', async () => {
		let tarForEpochRet = await CateInstance.targetForEpoch(epochCount);
		let targetForEpochRet = web3.utils.toBN(tarForEpochRet).toString(16);
		let expectTargetForEpoch = web3.utils.toBN(_MAXIMUM_TARGET).toString(16);
		console.log('***targetForEpochRet:    0x' + targetForEpochRet);
		console.log('***expectTargetForEpoch: 0x' + expectTargetForEpoch);
		assert.equal(targetForEpochRet, expectTargetForEpoch, 'contract should have the correct token target epoch for epoch count upon deployment');
	});
	
	it(TEST_TAG + 'contract has the correct token mining target upon deployment', async () => {
		let miningTarget = await CateInstance.miningTarget();
		let miningTargetRet = web3.utils.toBN(miningTarget).toString(16);
		let expectMiningTarget = web3.utils.toBN(_MAXIMUM_TARGET).toString(16);
		console.log('***miningTargetRet:    0x' + miningTargetRet);
		console.log('***expectMiningTarget: 0x' + expectMiningTarget);
		assert.equal(miningTargetRet, expectMiningTarget, 'contract should have the correct token mining target upon deployment');
	});
	
	
	
	it(TEST_TAG + 'transfers are enabled by default upon deployment', async () => {
		assert.equal(await CateInstance.transfersEnabled(), true, 'contract should have transfers enabled upon deployment');
	});
	
	it(TEST_TAG + 'mining is enabled by default upon deployment', async () => {
		assert.equal(await CateInstance.miningEnabled(), true, 'contract should have mining enabled upon deployment');
	});
	
	it(TEST_TAG + 'migration is enabled by default upon deployment', async () => {
		assert.equal(await CateInstance.migrationEnabled(), true, 'contract should have migration enabled upon deployment');
	});
})
