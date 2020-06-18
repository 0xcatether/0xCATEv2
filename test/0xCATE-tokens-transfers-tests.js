const ERC20Token = artifacts.require("./ERC20Token.sol");
const CateToken_v2 = artifacts.require("./_0xCatetherToken");
const CateToken_v2_mock = artifacts.require("./_0xCatetherToken_mock");
//const assert = require("chai").assert;
//const truffleAssert = require('truffle-assertions');

//const common = require("./common.js");
const TEST_TAG = '0xCATE tokens-transfers - ';
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
	let tokensReward = 5000; //0.5 0xCATE tokens as transfer reward
	
	
	
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
		
		// add some tokens for owner with the mock instance to test transfers
		let tokens = ownerTokens;
		await ci_mock.mintTokens(tokens, {from: contractOwner});
		assert.equal(await ci_mock.balanceOf(contractOwner), tokens, 'contractOwner should have ' + tokens + " tokens");
    });
	
	
	
	it(TEST_TAG + 'allocates the initial supply upon deployment', async () => {
		let totalSupply = await ci.totalSupply();
		assert.equal(totalSupply.toNumber(), 0, 'sets the total supply to 0');
		
		let contractOwnerBalance = await ci.balanceOf(contractOwner);
		assert.equal(contractOwnerBalance.toNumber(), 0, 'contract owner allocated balance should be 0');
	});
	
	it(TEST_TAG + 'transfers token ownership', async () => {
		// Test `require` statement first by transferring something larger than the sender's balance
		try {
			await ci_mock.transfer.call(accounts[1], ownerTokens + 1); //99999999999999999999999);
			assert.fail();
		} catch(error) {
			assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
		}
		
		let tokens = 250000;
		let success = await ci_mock.transfer.call(accounts[1], tokens, { from: accounts[0] });
		assert.equal(success, true, 'it returns true');
		
		let tx = await ci_mock.transfer(accounts[1], tokens, { from: accounts[0] });
		assert(tx.logs.length >= 1, 'triggers at least one event');
		assert.equal(tx.logs[0].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[0].args.from, accounts[0], 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[0].args.to, accounts[1], 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[0].args.tokens, tokens, 'logs the transfer amount');
		
		/*assert.equal(tx.logs[1].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[1].args.from, 0, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[1].args.to, accounts[0], 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[1].args.tokens, 5000, 'logs the transfer amount');*/
		
		assert.equal(tx.logs[1].event, 'Donation', 'should be the "Donation" event');
		assert.equal(tx.logs[1].args.donation, accounts[0], 'logs the account the tokens are donated to');
		
		let balance = await ci_mock.balanceOf(accounts[1]);
		assert.equal(balance.toNumber(), tokens, 'adds the amount to the receiving account');
		
        balance = await ci_mock.balanceOf(accounts[0]);
		assert.equal(balance.toNumber(), ownerTokens-tokens+tokensReward, 'deducts the amount from the sending account');
	});
	
	it(TEST_TAG + 'transfers token ownership with donation address', async () => {
		// add donation address
		await ci_mock.changeDonation(user1, {from: contractOwner});
		assert.equal(await ci_mock.donationsTo.call(contractOwner), user1, 'donation address should be set by now');
		
		let tokens = 250000;
		let success = await ci_mock.transfer.call(admin1, tokens, { from: contractOwner });
		assert.equal(success, true, 'it returns true');
		
		let tx = await ci_mock.transfer(admin1, tokens, { from: contractOwner });
		assert(tx.logs.length >= 1, 'triggers at least one event');
		
		assert.equal(tx.logs[0].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[0].args.from, contractOwner, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[0].args.to, admin1, 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[0].args.tokens, tokens, 'logs the transfer amount');
		
		/*assert.equal(tx.logs[1].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[1].args.from, 0, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[1].args.to, contractOwner, 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[1].args.tokens, 5000, 'logs the transfer amount');*/
		
		assert.equal(tx.logs[1].event, 'Donation', 'should be the "Donation" event');
		assert.equal(tx.logs[1].args.donation, contractOwner, 'logs the account the tokens are donated to');
		
		/*assert.equal(tx.logs[3].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[3].args.from, 0, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[3].args.to, user1, 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[3].args.tokens, 5000, 'logs the transfer amount');*/
		
		assert.equal(tx.logs[2].event, 'Donation', 'should be the "Donation" event');
		assert.equal(tx.logs[2].args.donation, user1, 'logs the account the tokens are donated to');
		
		let balance = await ci_mock.balanceOf(admin1);
		assert.equal(balance.toNumber(), tokens, 'correct balance expected');
		
        balance = await ci_mock.balanceOf(contractOwner);
		assert.equal(balance.toNumber(), ownerTokens-tokens+tokensReward, 'correct balance expected');
		
		balance = await ci_mock.balanceOf(user1);
		assert.equal(balance.toNumber(), 5000, 'correct balance expected');
	});
	
	it(TEST_TAG + 'approves tokens for delegated transfer', async () => {
		let success = await ci_mock.approve.call(accounts[1], 100);
		assert.equal(success, true, 'it returns true');
		
		let tx = await ci_mock.approve(accounts[1], 100, { from: accounts[0] });
		assert.equal(tx.logs.length, 1, 'triggers one event');
		assert.equal(tx.logs[0].event, 'Approval', 'should be the "Approval" event');
		assert.equal(tx.logs[0].args.tokenOwner, accounts[0], 'logs the account the tokens are authorized by');
		assert.equal(tx.logs[0].args.spender, accounts[1], 'logs the account the tokens are authorized to');
		assert.equal(tx.logs[0].args.tokens, 100, 'logs the transfer amount');
		
		let allowance = await ci_mock.allowance(accounts[0], accounts[1]);
		assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated trasnfer');
	});
	
	it(TEST_TAG + 'handles delegated token transfers', async () => {
		let fromAccount = accounts[2];
		let toAccount = accounts[3];
		let spendingAccount = accounts[4];
		
		// Transfer some tokens to fromAccount
		let tx = await ci_mock.transfer(fromAccount, 100, { from: accounts[0] });
		
		// Approve spendingAccount to spend 10 tokens form fromAccount
		tx = await ci_mock.approve(spendingAccount, 10, { from: fromAccount });
		
		// Try transferring something larger than the sender's balance
		try {
			await ci_mock.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
			assert.fail();
		} catch(error) {
			assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
		}
		
		// Try transferring something larger than the approved amount
		try {
			await ci_mock.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
			assert.fail();
		} catch (error) {
			assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
		}
		
		let success = await ci_mock.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
		assert.equal(success, true, 'transferFrom should return true');
		
		tx = await ci_mock.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
		assert(tx.logs.length >= 2, 'triggers at least two events');
		
		assert.equal(tx.logs[0].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[0].args.from, fromAccount, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[0].args.to, toAccount, 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[0].args.tokens, 10, 'logs the transfer amount');
		
		assert.equal(tx.logs[1].event, 'Donation', 'should be the "Donation" event');
		assert.equal(tx.logs[1].args.donation, spendingAccount, 'logs the account the tokens are donated to');
		
		let balance = await ci_mock.balanceOf(fromAccount);
		assert.equal(balance.toNumber(), 90, 'deducts the amount from the sending account');
		
		balance = await ci_mock.balanceOf(toAccount);
		assert.equal(balance.toNumber(), 10, 'adds the amount from the receiving account');
		
		balance = await ci_mock.balanceOf(spendingAccount);
		assert.equal(balance.toNumber(), tokensReward, 'transfer reward amount to transfer execution spender');
		
		let allowance = await ci_mock.allowance(fromAccount, spendingAccount);
		assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
	});
	
	it(TEST_TAG + 'handles delegated token transfers with donation address', async () => {
		let fromAccount = accounts[2];
		let toAccount = accounts[3];
		let spendingAccount = accounts[4];
		let beneficiary = accounts[5];
		
		// add donation address
		await ci_mock.changeDonation(beneficiary, {from: spendingAccount});
		assert.equal(await ci_mock.donationsTo.call(spendingAccount), beneficiary, 'donation address should be set by now');
		
		// Transfer some tokens to fromAccount
		let tx = await ci_mock.transfer(fromAccount, 100, { from: contractOwner });
		
		// Approve spendingAccount to spend 10 tokens form fromAccount
		tx = await ci_mock.approve(spendingAccount, 10, { from: fromAccount });
		
		let success = await ci_mock.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
		assert.equal(success, true, 'transferFrom should return true');
		
		tx = await ci_mock.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
		assert(tx.logs.length >= 1, 'triggers at least one event');
		
		assert.equal(tx.logs[0].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[0].args.from, fromAccount, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[0].args.to, toAccount, 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[0].args.tokens, 10, 'logs the transfer amount');
		
		/*assert.equal(tx.logs[1].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[1].args.from, 0, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[1].args.to, spendingAccount, 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[1].args.tokens, 5000, 'logs the transfer amount');*/
		
		assert.equal(tx.logs[1].event, 'Donation', 'should be the "Donation" event');
		assert.equal(tx.logs[1].args.donation, spendingAccount, 'logs the account the tokens are donated to');
		
		/*assert.equal(tx.logs[3].event, 'Transfer', 'should be the "Transfer" event');
		assert.equal(tx.logs[3].args.from, 0, 'logs the account the tokens are transferred from');
		assert.equal(tx.logs[3].args.to, beneficiary, 'logs the account the tokens are transferred to');
		assert.equal(tx.logs[3].args.tokens, 5000, 'logs the transfer amount');*/
		
		assert.equal(tx.logs[2].event, 'Donation', 'should be the "Donation" event');
		assert.equal(tx.logs[2].args.donation, beneficiary, 'logs the account the tokens are donated to');
		
		let balance = await ci_mock.balanceOf(fromAccount);
		assert.equal(balance.toNumber(), 90, 'correct balance expected');
		
		balance = await ci_mock.balanceOf(toAccount);
		assert.equal(balance.toNumber(), 10, 'correct balance expected');
		
		balance = await ci_mock.balanceOf(spendingAccount);
		assert.equal(balance.toNumber(), 5000, 'correct balance expected');
		
		balance = await ci_mock.balanceOf(beneficiary);
		assert.equal(balance.toNumber(), 5000, 'correct balance expected');
		
		let allowance = await ci_mock.allowance(fromAccount, spendingAccount);
		assert.equal(allowance.toNumber(), 0, 'correct allowance expected');
	});
});
