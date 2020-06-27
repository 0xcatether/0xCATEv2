const ERC20Token = artifacts.require("./ERC20Token.sol");
const CateToken_v2 = artifacts.require("./_0xCatetherToken");
const CateToken_v2_mock = artifacts.require("./_0xCatetherToken_mock");
//const assert = require("chai").assert;
//const truffleAssert = require('truffle-assertions');

//const common = require("./common.js");
const TEST_TAG = '0xCATE tokens-migration - ';
let ownerTokens = 500000000;



//contract(common.TEST_CONTRACT_NAME, async accounts => {
contract("0xCATE tests", async accounts => {
	var tokenInstance;
	var ci; //0xCATE instance
	var dci; //0xCATE instance for disabled transfers
	var ci_mock; //0xCATE instance mock for testing purposes
	let contractOwner = accounts[0];
	let admin1 = accounts[1];
	let admin2 = accounts[2];
	let user1 = accounts[3];
	let user2 = accounts[4];
	
	
	
	// 'beforeEach' function will run before each test creating a new instance of the contract each time
	beforeEach('setup contract for each test', async () => {
		
		//tokenInstance = await ERC20Token.deployed();
		tokenInstance = await ERC20Token.new(ownerTokens, {from: contractOwner});
		ci = await CateToken_v2.new({from: contractOwner});
		ci_mock = await CateToken_v2_mock.new(tokenInstance.address, {from: contractOwner});
		//ci_mock = await CateToken_v2_mock.deployed();
		
		//disabled migration contract
		//await dci.enableMigration(false, {from: contractOwner});
		
		// add a system admin to perform admin operations
		await ci.addAdmin(admin1, {from: contractOwner});
		assert.equal(await ci.isAdmin(admin1), true, 'admin1 should have admin role by now');
    });
	
	
	
	it(TEST_TAG + '[approveAndCall] migrate tokens from deprecated contract in one call test', async () => {
		/// NOTE: event 'MigratedTokens(address indexed user, uint tokens)' will not be called using "approveAndCall" function
		
		// deprecated contract must implement "approveAndCall" method in a single transaction
		// to call function "receiveApproval" of interface "ApproveAndCallFallBack" defined in new contract
		//let newContractAddress = ci.address;
		let newContractAddress = ci_mock.address;
		let migrateTokens = 1000;
		let no_bytes_data = new String("");
		
		let userOldTokens = ownerTokens;
		
		assert.equal(await ci_mock.balanceOf(contractOwner), 0, "migration must be enabled");
		assert.equal(await ci_mock.migrationEnabled(), true, "migration must be enabled");
		
		let userOldTokenBalance1 = await tokenInstance.balanceOf(contractOwner);
		let newContractOldTokenBalance1 = await tokenInstance.balanceOf(newContractAddress);
		assert.equal(userOldTokenBalance1, userOldTokens, 'userOldTokenBalance1 should be ' + userOldTokens);
		assert.equal(newContractOldTokenBalance1, 0, 'newContractOldTokenBalance1 should be ' + 0);
		
		let userTokenBalance1 = await ci_mock.balanceOf(contractOwner);
		let newContractTokenBalance1 = await ci_mock.balanceOf(newContractAddress);
		assert.equal(userTokenBalance1, 0, 'userTokenBalance1 should be ' + 0);
		assert.equal(newContractTokenBalance1, 0, 'newContractTokenBalance1 should be ' + 0);
		let newContractTokensMinted1 = await ci_mock.tokensMinted();
		assert.equal(newContractTokensMinted1, 0, 'newContractTokensMinted1 should be ' + 0);
		
		/// contractOwner is doing the migration of his tokens from old/deprecated contract to the new one
		/// contractOwner is the deployer of old contract and the owner of the tokens given to him in contructor
		/// contractOwner is approving new contract to take his tokens on his behalf from old/deprecated contract and give him new tokens in new contract
		/// the new contract will be the owner and have the old tokens in deprecated contract
		//let tx = await tokenInstance.approveAndCall( newContractAddress, migrateTokens, no_bytes_data, {from: contractOwner});
		
		
		
		/// wait for x confirmations on the network before accepting the transaction.
		/// this does not work with metamask
		let reqConfirmations = 5;
		let promise1 = new Promise((resolve, reject) => {
			let tx_receipt;
			
			tokenInstance.approveAndCall(newContractAddress, migrateTokens, no_bytes_data, {from: contractOwner})
			.on('transactionHash', function(hash) {
				console.log('tokenInstance.approveAndCall transactionHash: ' + hash);
			})
			.on('receipt', function(receipt) {
				console.log('tokenInstance.approveAndCall receipt >>');
				console.log('receipt: ' + JSON.stringify(receipt));
				tx_receipt = receipt;
			})
			.on('confirmation', function(confirmationNumber, receipt) {
				console.log('tokenInstance.approveAndCall confirmation >>');
				console.log('confirmationNumber: ' + confirmationNumber);
				if (confirmationNumber === reqConfirmations) {
					console.log('receipt: ' + JSON.stringify(receipt));
					resolve(tx_receipt);
				}
			})
			.on('error', function(err) {
				console.log('tokenInstance.approveAndCall err: ' + err.toString());
				reject(err);
			});
		});
		
		/// this is code for metamask, 'res' is transaction hash
		/*let promise1 = new Promise((resolve, reject) => {
			tokenInstance.approveAndCall(newContractAddress, migrateTokens, no_bytes_data, {from: contractOwner},
			(err, res) => {
				if (err) {
					var err1 = "tokenInstance.approveAndCall(" + newContractAddress + ", " + migrateTokens + ") ERROR: " + JSON.stringify(err);
					console.log(err1);
					reject(err1);
				}
				resolve(res);
			});
		});*/
		
		let tx = await promise1;
		//console.log("***promise1 return >> " + JSON.stringify(tx));
		
		
		// check for emitted event 'MigratedTokens(address indexed user, uint tokens)'
		console.log("***tx.logs " + "[" + tx.logs.length + "]" + " >> \n" + JSON.stringify(tx.logs));
		assert.equal(tx.logs.length, 3, 'approveAndCall should trigger 2 events');
		assert.equal(tx.logs[0].event, 'Approval', 'should be the "Approval" event');
		assert.equal(tx.logs[1].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[2].event, 'MigratedTokens', 'should be the "MigratedTokens" event');
		assert.equal(tx.logs[2].args.user, contractOwner, 'logs the user address that migrated his tokens');
		assert.equal(tx.logs[2].args.tokens, migrateTokens, 'logs the tokens amount migrated');
		
		//check for tokens balances
		let userOldTokenBalance2 = await tokenInstance.balanceOf(contractOwner);
		let newContractOldTokenBalance2 = await tokenInstance.balanceOf(newContractAddress);
		assert.equal(userOldTokenBalance2, userOldTokens - migrateTokens, 'userOldTokenBalance2 should be ' + (userOldTokens - migrateTokens));
		assert.equal(newContractOldTokenBalance2, migrateTokens, 'newContractOldTokenBalance2 should be ' + migrateTokens);
		
		let userTokenBalance2 = await ci_mock.balanceOf(contractOwner);
		let newContractTokenBalance2 = await ci_mock.balanceOf(newContractAddress);
		assert.equal(userTokenBalance2, migrateTokens, 'userTokenBalance2 should be ' + migrateTokens);
		assert.equal(newContractTokenBalance2, 0, 'newContractTokenBalance2 should be ' + 0);
		let newContractTokensMinted2 = await ci_mock.tokensMinted();
		assert.equal(newContractTokensMinted2, migrateTokens, 'newContractTokensMinted2 should be ' + migrateTokens);
	});
	
	
	
	it(TEST_TAG + '[migrateDeprecatedTokens] migrate tokens from deprecated contract in two calls test', async () => {
		/// NOTE: Steps:
		//1. Call 'approve' function in old contract to allow new contract address to transfer tokens on your behalf for the migration.
		//2. Call 'migrateDeprecatedTokens' function in the new contract
		
		let userOldTokens = ownerTokens;
		
		let newContract = ci_mock;
		let newContractAddress = ci_mock.address;
		let migrateTokens = userOldTokens;
		let no_bytes_data = new String("");
		
		
		assert.equal(await ci_mock.balanceOf(contractOwner), 0, "migration must be enabled");
		assert.equal(await ci_mock.migrationEnabled(), true, "migration must be enabled");
		
		let userOldTokenBalance1 = await tokenInstance.balanceOf(contractOwner);
		let newContractOldTokenBalance1 = await tokenInstance.balanceOf(newContractAddress);
		assert.equal(userOldTokenBalance1, userOldTokens, 'userOldTokenBalance1 should be ' + userOldTokens);
		assert.equal(newContractOldTokenBalance1, 0, 'newContractOldTokenBalance1 should be ' + 0);
		
		let userTokenBalance1 = await ci_mock.balanceOf(contractOwner);
		let newContractTokenBalance1 = await ci_mock.balanceOf(newContractAddress);
		assert.equal(userTokenBalance1, 0, 'userTokenBalance1 should be ' + 0);
		assert.equal(newContractTokenBalance1, 0, 'newContractTokenBalance1 should be ' + 0);
		
		/// contractOwner is doing the migration of his tokens from old/deprecated contract to the new one
		/// contractOwner is the deployer of old contract and the owner of the tokens given to him in contructor
		/// contractOwner is approving new contract to take his tokens on his behalf from old/deprecated contract and give him new tokens in new contract
		/// the new contract will be the owner and have the old tokens in deprecated contract
		
		// 1. allow new contract to transfer your migration tokens on your behalf
		await tokenInstance.approve( newContractAddress, migrateTokens, {from: contractOwner});
		assert.equal((await tokenInstance.allowance(contractOwner, newContractAddress)), migrateTokens, "user should have allowed new contract to transfer migration tokens on his behalf by now");
		
		// 2. migrate tokens to new contract
		
		//give user1 some tokens
		let user1Tokens = 1000;
		await tokenInstance.transfer(user1, user1Tokens, {from: contractOwner});
		assert.equal((await tokenInstance.balanceOf(user1)), user1Tokens, "user1 should have " + user1Tokens + " tokens by now");
		
		//user1 trying to migrate tokens without approval should fail
		try {
            await newContract.migrateDeprecatedTokens({from: user1});
			assert.fail();
        } catch (error) {
			console.log("***user1 migrateDeprecatedTokens error: " + error.message);
            assert(error.message.indexOf('revert') >= 0, 'migrateDeprecatedTokens error message must contain revert');
        }
		let user1TokenBalance = await tokenInstance.balanceOf(user1);
		assert.equal(user1TokenBalance, user1Tokens, 'user1 should still have his tokens');
		
		//user2 trying to migrate zero tokens without approval should be ok migrating zero tokens
		let tx = await newContract.migrateDeprecatedTokens({from: user2});
		console.log("***tx.logs " + "[" + tx.logs.length + "]" + " >> \n" + JSON.stringify(tx.logs));
		assert.equal(tx.logs.length, 2, 'migrateDeprecatedTokens should trigger one event');
		assert.equal(tx.logs[0].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[1].event, 'MigratedTokens', 'should be the "MigratedTokens" event');
		assert.equal(tx.logs[1].args.user, user2, 'logs the user address that migrated his tokens');
		assert.equal(tx.logs[1].args.tokens, 0, 'logs the tokens amount migrated');
		let user2TokenBalance = await tokenInstance.balanceOf(user2);
		assert.equal(user2TokenBalance, 0, 'user2 should still have no tokens');
		
		
		
		//contractOwner doing migration of his own tokens he has left after sending some to user1
		migrateTokens = migrateTokens - user1Tokens;
		
		//contractOwner migrates tokens to new contract
		tx = await newContract.migrateDeprecatedTokens({from: contractOwner});
		// check for emitted event 'MigratedTokens(address indexed user, uint tokens)'
		console.log("***tx.logs " + "[" + tx.logs.length + "]" + " >> \n" + JSON.stringify(tx.logs));
		assert.equal(tx.logs.length, 2, 'migrateDeprecatedTokens should trigger one event');
		assert.equal(tx.logs[0].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[1].event, 'MigratedTokens', 'should be the "MigratedTokens" event');
		assert.equal(tx.logs[1].args.user, contractOwner, 'logs the user address that migrated his tokens');
		assert.equal(tx.logs[1].args.tokens, migrateTokens, 'logs the tokens amount migrated');
		
		//check for tokens balances
		let userOldTokenBalance2 = await tokenInstance.balanceOf(contractOwner);
		let newContractOldTokenBalance2 = await tokenInstance.balanceOf(newContractAddress);
		assert.equal(userOldTokenBalance2, userOldTokens - migrateTokens - user1Tokens, 'userOldTokenBalance2 should be ' + (userOldTokens - migrateTokens - user1Tokens));
		assert.equal(newContractOldTokenBalance2, migrateTokens, 'newContractOldTokenBalance2 should be ' + migrateTokens);
		
		let userTokenBalance2 = await ci_mock.balanceOf(contractOwner);
		let newContractTokenBalance2 = await ci_mock.balanceOf(newContractAddress);
		assert.equal(userTokenBalance2, migrateTokens, 'userTokenBalance2 should be ' + migrateTokens);
		assert.equal(newContractTokenBalance2, 0, 'newContractTokenBalance2 should be ' + 0);
	});
})
