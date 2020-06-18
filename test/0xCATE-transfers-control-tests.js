const ERC20Token = artifacts.require("./ERC20Token.sol");
const CateToken_v2 = artifacts.require("./_0xCatetherToken.sol");
//const assert = require("chai").assert;
//const truffleAssert = require('truffle-assertions');

//const common = require("./common.js");
const TEST_TAG = '0xCATE transfers-control - ';



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
		
		//disabled transfers contract
		dci = await CateToken_v2.new({from: contractOwner});
		await dci.enableTransfers(false, {from: contractOwner});
		
		// add a system admin to perform admin operations
		await ci.addAdmin(admin1, {from: contractOwner});
		assert.equal(await ci.isAdmin(admin1), true, 'admin1 should have admin role by now');
		
		// add a system admin to perform admin operations
		await dci.addAdmin(admin1, {from: contractOwner});
		assert.equal(await dci.isAdmin(admin1), true, 'admin1 should have admin role by now');
    });
	
	
	
	it(TEST_TAG + 'admin can disable transfers', async () => {
		await ci.enableTransfers(false, {from: admin1});
		assert.equal(await ci.transfersEnabled(), false, 'contract should have transfers disabled by now');
	});
	
	it(TEST_TAG + 'user can NOT disable transfers', async () => {
		// user1 trying to disable transfers should fail
		try {
            await ci.enableTransfers(false, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'disableTransfers error message must contain revert');
        }
		assert.equal(await ci.transfersEnabled(), true, 'contract should still have transfers enabled');
	});
	
	it(TEST_TAG + 'disable transfers should be possible only when they are enabled', async () => {
		let res = await dci.enableTransfers.call(false, {from: admin1});
		assert.equal(res, false, 'transfers should still be disabled');
	});
	
	it(TEST_TAG + 'disable transfers should trigger "TransfersDisabled" event', async () => {
		let receipt = await ci.enableTransfers(false, {from: admin1});
		// check for emitted event 'TransfersDisabled(address indexed _admin)'
		assert.equal(receipt.logs.length, 1, 'disableTransfers should trigger an event');
		assert.equal(receipt.logs[0].event, 'TransfersDisabled', 'should be the "TransfersDisabled" event');
		assert.equal(receipt.logs[0].args.admin, admin1, 'logs the admin address performing the operation');
	});
	
	
	
	it(TEST_TAG + 'admin can enable transfers', async () => {
		await dci.enableTransfers(true, {from: admin1});
		assert.equal(await dci.transfersEnabled(), true, 'contract should have transfers enabled by now');
	});
	
	it(TEST_TAG + 'user can NOT enable transfers', async () => {
		// user1 trying to enable transfers should fail
		try {
            await dci.enableTransfers(true, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'enableTransfers error message must contain revert');
        }
		assert.equal(await dci.transfersEnabled(), false, 'contract should still have transfers disabled');
	});
	
	it(TEST_TAG + 'enable transfers should be possible only when they are disabled', async () => {
		let res = await ci.enableTransfers.call(true, {from: admin1});
		assert.equal(res, false, 'transfers should still be enabled');
	});
	
	it(TEST_TAG + 'enable transfers should trigger "TransfersEnabled" event', async () => {
		let receipt = await dci.enableTransfers(true, {from: admin1});
		// check for emitted event 'TransfersEnabled(address indexed _admin)'
		assert.equal(receipt.logs.length, 1, 'enableTransfers should trigger an event');
		assert.equal(receipt.logs[0].event, 'TransfersEnabled', 'should be the "TransfersEnabled" event');
		assert.equal(receipt.logs[0].args.admin, admin1, 'logs the admin address performing the operation');
	});
	
	
	
	it(TEST_TAG + 'can not transfer tokens when transfers are disabled', async () => {
		let tokens = 1000;
		
		try {
            await dci.transfer(admin2, tokens, {from: admin1});
			assert.fail();
        } catch (error) {
			console.log("*** transfer error >> " + JSON.stringify(error));
            assert(error.message.indexOf('revert') >= 0, 'transfer error message must contain revert');
        }
	});
})
