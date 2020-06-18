const ERC20Token = artifacts.require("./ERC20Token.sol");
const CateToken_v2 = artifacts.require("./_0xCatetherToken.sol");
//const assert = require("chai").assert;
//const truffleAssert = require('truffle-assertions');

//const common = require("./common.js");
const TEST_TAG = '0xCATE migration-control - ';



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
		
		//disabled migration contract
		dci = await CateToken_v2.new({from: contractOwner});
		await dci.enableMigration(false, {from: contractOwner});
		
		// add a system admin to perform admin operations
		await ci.addAdmin(admin1, {from: contractOwner});
		assert.equal(await ci.isAdmin(admin1), true, 'admin1 should have admin role by now');
		
		// add a system admin to perform admin operations
		await dci.addAdmin(admin1, {from: contractOwner});
		assert.equal(await dci.isAdmin(admin1), true, 'admin1 should have admin role by now');
    });
	
	
	
	it(TEST_TAG + 'admin can disable migration', async () => {
		await ci.enableMigration(false, {from: admin1});
		assert.equal(await ci.migrationEnabled(), false, 'contract should have migration disabled by now');
	});
	
	it(TEST_TAG + 'user can NOT disable migration', async () => {
		// user1 trying to disable migration should fail
		try {
            await ci.enableMigration(false, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'disableMigration error message must contain revert');
        }
		assert.equal(await ci.migrationEnabled(), true, 'contract should still have migration enabled');
	});
	
	it(TEST_TAG + 'disable migration should be possible only when they are enabled', async () => {
		let res = await dci.enableMigration.call(false, {from: admin1});
		assert.equal(res, false, 'migration should still be disabled');
	});
	
	it(TEST_TAG + 'disable migration should trigger "MigrationDisabled" event', async () => {
		let receipt = await ci.enableMigration(false, {from: admin1});
		// check for emitted event 'MigrationDisabled(address indexed _admin)'
		assert.equal(receipt.logs.length, 1, 'disableMigration should trigger an event');
		assert.equal(receipt.logs[0].event, 'MigrationDisabled', 'should be the "MigrationDisabled" event');
		assert.equal(receipt.logs[0].args.admin, admin1, 'logs the admin address performing the operation');
	});
	
	
	
	it(TEST_TAG + 'admin can enable migration', async () => {
		await dci.enableMigration(true, {from: admin1});
		assert.equal(await dci.migrationEnabled(), true, 'contract should have migration enabled by now');
	});
	
	it(TEST_TAG + 'user can NOT enable migration', async () => {
		// user1 trying to enable migration should fail
		try {
            await dci.enableMigration(true, {from: user1});
			assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'enableMigration error message must contain revert');
        }
		assert.equal(await dci.migrationEnabled(), false, 'contract should still have migration disabled');
	});
	
	it(TEST_TAG + 'enable migration should be possible only when they are disabled', async () => {
		let res = await ci.enableMigration.call(true, {from: admin1});
		assert.equal(res, false, 'migration should still be enabled');
	});
	
	it(TEST_TAG + 'enable migration should trigger "MigrationEnabled" event', async () => {
		let receipt = await dci.enableMigration(true, {from: admin1});
		// check for emitted event 'MigrationEnabled(address indexed _admin)'
		assert.equal(receipt.logs.length, 1, 'enableMigration should trigger an event');
		assert.equal(receipt.logs[0].event, 'MigrationEnabled', 'should be the "MigrationEnabled" event');
		assert.equal(receipt.logs[0].args.admin, admin1, 'logs the admin address performing the operation');
	});
	
	
	
	it(TEST_TAG + 'can not migrate tokens from deprecated contract when migration is disabled', async () => {
		let tokens = 1000;
		let no_bytes_data = new String("");
		
		try {
            await dci.receiveApproval(user1, tokens, ERC20Token.address, no_bytes_data, {from: admin1});
			assert.fail();
        } catch (error) {
			console.log("*** token migration error >> " + JSON.stringify(error));
            assert(error.message.indexOf('revert') >= 0, 'token migration error message must contain revert');
        }
	});
})
