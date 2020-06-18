const ERC20Token = artifacts.require("./ERC20Token.sol");
const CateToken_v2 = artifacts.require("./_0xCatetherToken.sol");
//const assert = require("chai").assert;
//const truffleAssert = require('truffle-assertions');

//const common = require("./common.js");
const TEST_TAG = '0xCATE mining-control - ';



//contract(common.TEST_CONTRACT_NAME, async accounts => {
contract("0xCATE tests", async accounts => {
	var tokenInstance;
	var ci; //0xCATE instance
	var dci; //0xCATE instance for disabled transfers
	let contractOwner = accounts[0];
	let admin1 = accounts[1];
	let admin2 = accounts[2];
	let user1 = accounts[3];
	let user2 = accounts[4];
	
	
	
	// 'beforeEach' function will run before each test creating a new instance of the contract each time
	beforeEach('setup contract for each test', async () => {
		
		tokenInstance = await ERC20Token.deployed();
		ci = await CateToken_v2.new({from: contractOwner});
		
		//disabled mining contract
		dci = await CateToken_v2.new({from: contractOwner});
		await dci.enableMining(false, {from: contractOwner});
		
		// add a system admin to perform admin operations
		await ci.addAdmin(admin1, {from: contractOwner});
		assert.equal(await ci.isAdmin(admin1), true, 'admin1 should have admin role by now');
		
		// add a system admin to perform admin operations
		await dci.addAdmin(admin1, {from: contractOwner});
		assert.equal(await dci.isAdmin(admin1), true, 'admin1 should have admin role by now');
    });
	
	
	
	it(TEST_TAG + 'admin can disable token mining', async () => {
		await ci.enableMining(false, {from: admin1});
		assert.equal(await ci.miningEnabled(), false, 'contract should have token mining disabled by now');
	});
	
	it(TEST_TAG + 'user can NOT disable token mining', async () => {
		// user1 trying to disable token mining should fail
		try {
            await ci.enableMining(false, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'disableMining error message must contain revert');
        }
		assert.equal(await ci.miningEnabled(), true, 'contract should still have token mining enabled');
	});
	
	it(TEST_TAG + 'disable token mining should be possible only when they are enabled', async () => {
		let res = await dci.enableMining.call(false, {from: admin1});
		assert.equal(res, false, 'token mining should still be disabled');
	});
	
	it(TEST_TAG + 'disable token mining should trigger "MiningDisabled" event', async () => {
		let receipt = await ci.enableMining(false, {from: admin1});
		// check for emitted event 'MigrationDisabled(address indexed _admin)'
		assert.equal(receipt.logs.length, 1, 'disableMining should trigger an event');
		assert.equal(receipt.logs[0].event, 'MiningDisabled', 'should be the "MiningDisabled" event');
		assert.equal(receipt.logs[0].args.admin, admin1, 'logs the admin address performing the operation');
	});
	
	
	
	it(TEST_TAG + 'admin can enable token mining', async () => {
		await dci.enableMining(true, {from: admin1});
		assert.equal(await dci.miningEnabled(), true, 'contract should have token mining enabled by now');
	});
	
	it(TEST_TAG + 'user can NOT enable token mining', async () => {
		// user1 trying to enable token mining should fail
		try {
            await dci.enableMining(true, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'enableMining error message must contain revert');
        }
		assert.equal(await dci.miningEnabled(), false, 'contract should still have token mining disabled');
	});
	
	it(TEST_TAG + 'enable token mining should be possible only when they are disabled', async () => {
		let res = await ci.enableMining.call(true, {from: admin1});
		assert.equal(res, false, 'token mining should still be enabled');
	});
	
	it(TEST_TAG + 'enable token mining should trigger "MiningEnabled" event', async () => {
		let receipt = await dci.enableMining(true, {from: admin1});
		// check for emitted event 'MiningEnabled(address indexed _admin)'
		assert.equal(receipt.logs.length, 1, 'enableMining should trigger an event');
		assert.equal(receipt.logs[0].event, 'MiningEnabled', 'should be the "MiningEnabled" event');
		assert.equal(receipt.logs[0].args.admin, admin1, 'logs the admin address performing the operation');
	});
	
	
	
	it(TEST_TAG + 'can not mine token when mining is disabled', async () => {
		let nonce = 1;
		//get bytes32 in javascript using "web3.fromAscii" and "web3.fromUtf8" too
		let challenge_digest = new String("0x341f85f5eca6304166fcfb6f591d49f6019f23fa39be0615e6417da06bf747ce");
		let challenge_digest_bytes32 = challenge_digest.valueOf();
		
		try {
            await dci.mint(nonce, challenge_digest_bytes32, {from: admin1});
			assert.fail();
        } catch (error) {
			console.log("*** mint error >> " + JSON.stringify(error));
            assert(error.message.indexOf('revert') >= 0, 'mint error message must contain revert');
        }
	});
})
