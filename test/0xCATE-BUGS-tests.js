const ERC20Token = artifacts.require("./ERC20Token.sol");
const CateToken_v2 = artifacts.require("./_0xCatetherToken");
const CateToken_v2_mock = artifacts.require("./_0xCatetherToken_mock");
//const assert = require("chai").assert;
//const truffleAssert = require('truffle-assertions');

//const common = require("./common.js");
const TEST_TAG = '0xCATE BUGS - ';

const tokenSymbol = "0xCATE";
const tokenName = "0xCatether Token";
const tokenDecimals = 4;
const deprecatedContractAddress = '0x8F7DbF90E71285552a687097220E1035C2e87639';
const _totalSupply = 0;
//const epochCount = 15516;
const _MAXIMUM_TARGET = '0x00000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'; //2**224
const _MINIMUM_TARGET = '0x000000000000000000000000000000000000000000000000000000000000FFFF'; //2**16
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
	let epochCount = 15516;
	
	
	
	// 'beforeEach' function will run before each test creating a new instance of the contract each time
	beforeEach('setup contract for each test', async () => {
		tokenInstance = await ERC20Token.new(ownerTokens, {from: contractOwner});
		ci = await CateToken_v2.new({from: contractOwner});
		ci_mock = await CateToken_v2_mock.new(tokenInstance.address, {from: contractOwner});
		epochCount = await ci_mock.epochCount();
    });
	
	
	
	it(TEST_TAG + '_reAdjustDifficulty variations bug find/assert test', async () => {
		let targetForEpoch;
		let targetForEpochRet;
		
		miningTarget = await ci_mock.miningTarget();
		miningTargetRet = web3.utils.toBN(miningTarget).toString(16);
			console.log("***miningTarget ret >>               " + miningTargetRet);
		
		let targetForEpoch_1 = await ci_mock.targetForEpoch(epochCount - 1);
		let targetForEpoch_1_ret = web3.utils.toBN(targetForEpoch_1);
			console.log("***targetForEpoch[-1] ret >>         " + targetForEpoch_1_ret.toString());
			console.log("***targetForEpoch[-1] ret >>         " + targetForEpoch_1_ret.toString(16));
		
		try {
            targetForEpoch = await ci_mock._reAdjustDifficulty_public.call(epochCount);
			targetForEpochRet = web3.utils.toBN(targetForEpoch).toString(16);
			console.log("***_reAdjustDifficulty_public ret >> " + targetForEpochRet);
			//assert.fail();
        } catch (error) {
			console.log("***_reAdjustDifficulty_public err: " + error.message);
            assert(error.message.indexOf('revert') >= 0, '_reAdjustDifficulty_public error message must contain revert');
        }
		
		try {
            targetForEpoch = await ci_mock._reAdjustDifficulty_Opt.call(epochCount);
			targetForEpochRet = web3.utils.toBN(targetForEpoch).toString(16);
			console.log("***_reAdjustDifficulty_Opt ret >>    " + targetForEpochRet);
			//assert.fail();
        } catch (error) {
			console.log("***_reAdjustDifficulty_Opt err: " + error.message);
            assert(error.message.indexOf('revert') >= 0, '_reAdjustDifficulty_Opt error message must contain revert');
        }
		
		try {
            targetForEpoch = await ci_mock._reAdjustDifficulty_Opt2.call(epochCount);
			targetForEpochRet = web3.utils.toBN(targetForEpoch).toString(16);
			console.log("***_reAdjustDifficulty_Opt2 ret >>   " + targetForEpochRet);
			//assert.fail();
        } catch (error) {
			console.log("***_reAdjustDifficulty_Opt2 err: " + error.message);
            assert(error.message.indexOf('revert') >= 0, '_reAdjustDifficulty_Opt2 error message must contain revert');
        }
		
		try {
            targetForEpoch = await ci_mock._reAdjustDifficultyTest.call(epochCount);
			targetForEpochRet = web3.utils.toBN(targetForEpoch).toString(16);
			console.log("***_reAdjustDifficultyTest ret >>    " + targetForEpochRet);
			//assert.fail();
        } catch (error) {
			console.log("***_reAdjustDifficultyTest err: " + error.message);
            assert(error.message.indexOf('revert') >= 0, '_reAdjustDifficultyTest error message must contain revert');
        }
		
		try {
            targetForEpoch = await ci_mock._reAdjustDifficultyTest2.call(epochCount);
			targetForEpochRet = web3.utils.toBN(targetForEpoch).toString(16);
			console.log("***_reAdjustDifficultyTest2 ret >>   " + targetForEpochRet);
			//assert.fail();
        } catch (error) {
			console.log("***_reAdjustDifficultyTest2 err: " + error.message);
            assert(error.message.indexOf('revert') >= 0, '_reAdjustDifficultyTest2 error message must contain revert');
        }
	});
	
	
	
	it(TEST_TAG + 'mint tests', async () => {
		
		
		
		// transactions from address 0x439a0f5438c0042e1e3fda90343d97a87a9dacc9
		// test/reproduce reverted transactions
		// https://etherscan.io/tx/0x7fef9761c3d073a483794a93484b21620698aff378919a09f8b3e7f7afc81ae3
		// https://etherscan.io/tx/0xd2fef4e7fddffb1d24dbbf848641e49bcd746d83e689357280dcc16a12b17ec8
		// success transactions
		// https://etherscan.io/tx/0x630d7ae971a27a089a721633305598175f87605db75f2ccd0679fd596d8a30b4
		// https://etherscan.io/tx/0xbae93e58313761407766c154da5fc46f996d250f7bc66a3d72790ec6d308de0b
		
		// transactions from address 0xde5527eb62bde225d2f40013481cfb4b7130cfa4
		// test/reproduce transactions
		// https://etherscan.io/tx/0x0d67dbf72590989ba0733f1efbdbff41b247c0cf29fd4c27a8e3c01d4ce99603
		// https://etherscan.io/tx/0x35f56b470c3778bd605dd370c924f8d96737be37376cd38ec6275d4acd384e52
		
		
		
		let targetForEpoch;
		let targetForEpochRet;
		
		let fromAddress;
		let challenge_digest_bytes32_expect;
		let challengeNumber_bytes32;
		let challenge_digest_bytes32_ret;
		
		// test "revert" error on the blockchain when submit mining solution
		/// check why it revertd as challenge_digest is ok
		fromAddress = '0x439a0f5438c0042e1e3fda90343d97a87a9dacc9';
		console.log("\n ---testing reverted mining transaction with address >> " + fromAddress);
		
		//let nonce = 1317;
		/// ??? nonce not converted to correct input for smart contract ??? check next test is success
		// this is manual nonce input without hash, throws error
		//nonce = '0000000000000000000000000000000000000000000000000000000000000525'; //1317 decimal
		
		nonce = '91804b1c35843ed57ca784eff4190000000000006c59815a59c6ceda27131e53';
		nonce = web3.utils.toBN(nonce); //works
		console.log("   testing nonce conversion web3.utils.toBN >> " + nonce);
		challenge_digest_bytes32_expect = (new String('0x0002e525f55c0b655be850ee55c8b327530473669471f562aa5db5d24f51c3d9')).valueOf();
		epochCount = 15516;
		targetForEpoch = 13595144094825140886365815574517012670774989681744685079350353504540619436; //from main network on deprecated contract
		//targetForEpoch = web3.eth.abi.encodeParameter('uint256', targetForEpoch); //convert decimal to hex
		targetForEpoch = web3.utils.toBN(targetForEpoch.toString(16));
		console.log("   targetForEpoch[" + epochCount + "]                        >> " + targetForEpoch.toString(16));
		challengeNumber_bytes32 = (new String('0x781504f93328a5bf6401754a85baab350e71a11d9051cc86a8ff6f9ebcf38477')).valueOf();
		//let miningTarget = 13595144094825140886365815574517012670774989681744685079350353504540619436;
		
		challenge_digest_bytes32_ret = await ci_mock.do_keccak256.call(challengeNumber_bytes32, fromAddress, nonce);
		console.log("***do_keccak256 challenge_digest_bytes32_expect >> " + challenge_digest_bytes32_expect);
		console.log("***do_keccak256 challenge_digest_bytes32_ret    >> " + challenge_digest_bytes32_ret);
		assert.equal(challenge_digest_bytes32_ret, challenge_digest_bytes32_expect, "challenge_digest_bytes32 should match");
		
		
		
		let tx;
		try {
            //tx = await ci_mock.mint(nonce, challenge_digest_bytes32_expect, {from: fromAddress});
			tx = await ci_mock.mint_test.call(fromAddress, challengeNumber_bytes32, nonce, challenge_digest_bytes32_expect, targetForEpoch);
			assert(tx, true, "ci_mock.mint_test.call should be true");
			console.log("\n ***ci_mock.mint tx >>\n" + JSON.stringify(tx));
			//assert.fail();
        } catch (error) {
			console.log("***ci_mock.mint err: " + error.message);
            //assert(error.message.indexOf('revert') >= 0, 'ci_mock.mint error message must contain revert');
        }
		
		
		
		//// test success when submit mining solution
		fromAddress = '0xde5527eb62bde225d2f40013481cfb4b7130cfa4';
		console.log("\n ---testing successful mining with address >> " + fromAddress);
		nonce = web3.eth.abi.encodeParameter('uint256', '498'); ///*** convert literal integer to uint256 hex
		console.log("   testing nonce conversion encodeParameter >> " + nonce);
		nonce = '417a6c656872696136b1089fa6fdff7f00000000e284c9696d294dc5e55e1770';
		nonce = web3.utils.toBN(nonce); //works
		// nonce = web3.eth.abi.encodeParameter('uint256', nonce); //does not work
		console.log("   testing nonce conversion web3.utils.toBN >> " + nonce);
		console.log("   testing nonce conversion                 >> " + (new String('498')).valueOf());
		
		challenge_digest_bytes32_expect = (new String('0x00001b6c6a1b686e7446b7d7f38cee62901270ecef5d386652b212053e942eb1')).valueOf();
		epochCount = 15515;
		targetForEpoch = 11221431935868671287606344175206342258457676483312063064495781782647827283; //from main network on deprecated contract
		//targetForEpoch = web3.eth.abi.encodeParameter('uint256', targetForEpoch); //convert decimal to hex
		targetForEpoch = web3.utils.toBN(targetForEpoch.toString(16));
		console.log("   targetForEpoch[" + epochCount + "]                        >> " + targetForEpoch.toString(16));
		challengeNumber_bytes32 = (new String('0x16694bce03bd8d6ad92b2c924208991b70d15922f4c59ae7e60aa1f7a317f1cd')).valueOf();
		targetForEpoch = 
		
		challenge_digest_bytes32_ret = await ci_mock.do_keccak256.call(challengeNumber_bytes32, fromAddress, nonce);
		console.log("***do_keccak256 challenge_digest_bytes32_expect >> " + challenge_digest_bytes32_expect);
		console.log("***do_keccak256 challenge_digest_bytes32_ret    >> " + challenge_digest_bytes32_ret);
		
		
		
		try {
            //tx = await ci_mock.mint(nonce, challenge_digest_bytes32_expect, {from: fromAddress});
			tx = await ci_mock.mint_test.call(fromAddress, challengeNumber_bytes32, nonce, challenge_digest_bytes32_expect, targetForEpoch);
			assert(tx, true, "ci_mock.mint_test.call should be true");
			console.log("\n ***ci_mock.mint tx >>\n" + JSON.stringify(tx));
			//assert.fail();
        } catch (error) {
			console.log("***ci_mock.mint err: " + error.message);
            //assert(error.message.indexOf('revert') >= 0, 'ci_mock.mint error message must contain revert');
        }
		
		tx = await ci_mock.mint_test(fromAddress, challengeNumber_bytes32, nonce, challenge_digest_bytes32_expect, targetForEpoch);
		console.log("\n ***ci_mock.mint tx >>\n" + JSON.stringify(tx));
		assert.equal(tx.logs.length, 1, 'mint_test should trigger 1 event');
		assert.equal(tx.logs[0].event, 'Mint', 'should be the "Mint" event');
		
		
		
		console.log("\n\n");
		let nonce_test = 498;
		let nonce_ret = await ci_mock.do_keccak256_1.call(nonce_test);
		console.log("***do_keccak256_1 nonce_ret >> " + nonce_ret);
		
		let bytes_ret = await ci_mock.bytes32_test.call(challengeNumber_bytes32);
		console.log("***challengeNumber_bytes32 >> " + challengeNumber_bytes32);
		console.log("***bytes_ret               >> " + bytes_ret);
	});
})
