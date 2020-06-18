pragma solidity ^0.4.24;

import "./ERC20Interface.sol";
import "./EIP918Interface.sol";
import "./Owned.sol";
import "./Admin.sol";
import "./ApproveAndCallFallBack.sol";
import "./SafeMath.sol";
import "./ExtendedMath.sol";
import "./0xCATE_v2.sol";

// ----------------------------------------------------------------------------
// '0xCatether Token' contract
// Mineable ERC20 Token using Proof Of Work
//
// Symbol      : 0xCATE
// Name        : 0xCatether Token
// Total supply: No Limit
// Decimals    : 4
//
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// ERC20 Token, with the addition of symbol, name and decimals and an
// initial fixed supply
// ----------------------------------------------------------------------------
contract _0xCatetherToken_mock is _0xCatetherToken
{
    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------
    constructor(address deprecatedContractAddr)
		_0xCatetherToken()
		public
	{
        // needed as reference and to migrate tokens from deprecated contract
		deprecatedContractAddress = deprecatedContractAddr;
		
		// time between last 2 mining blocks with 300 sec (5 minutes)
		//timeStampForEpoch[(epochCount - 2)] = block.timestamp - 300;
		//timeStampForEpoch[(epochCount - 1)] = block.timestamp;
		
		// initialize time with main network data from deprecated contract for bugs tests
		//epochCount is 15516
		timeStampForEpoch[(epochCount - 2)] = 1542712657;
		timeStampForEpoch[(epochCount - 1)] = 1542714528;
		//1871 seconds difference between last 2 mining blocks (~ 31 minutes)
		
		// set miningTarget as latest in deprecated contract on main network
		targetForEpoch[epochCount - 1] = 11221431935868671287606344175206342258457676483312063064495781782647827283;
    }
	
	
	
	// ---
	// Mint some tokens for owner
	// ---
	function mintTokens(uint tokens) public onlyOwner {
		balances[owner] = balances[owner].add(tokens);
        _totalSupply = _totalSupply.add(tokens);
	}
	
	
	
	// ---
	// Migrate deprecated contract tokens to this one.
	// ---
	function migrateDeprecatedTokens () public whenTransfersEnabled whenMigrationEnabled {
		uint256 tokens = ERC20Interface(deprecatedContractAddress).balanceOf(msg.sender);
		//require(ERC20Interface(deprecatedContractAddress).allowance(msg.sender, address(this)) >= tokens, "Contract needs approval to use transferFrom");
		
		receiveApproval(msg.sender, tokens, deprecatedContractAddress, "");
	}
	
	
	
	function bytes32_test(bytes32 b) public returns (bytes32 ret) {
		
        ret = b;
	}
	
	function do_keccak256(bytes32 challengeNumber, address sender, uint256 nonce) public returns (bytes32 digest) {
		
        //the PoW must contain work that includes a recent ethereum block hash (challenge number) and the msg.sender's address to prevent MITM attacks
        digest = keccak256(abi.encodePacked(challengeNumber, sender, nonce));
	}
	
	function do_keccak256_1(uint256 nonce) public returns (bytes32 digest) {
		
        //the PoW must contain work that includes a recent ethereum block hash (challenge number) and the msg.sender's address to prevent MITM attacks
        digest = keccak256(abi.encodePacked(nonce));
	}
	
	/*function do_keccak256_2(bytes32 challengeNumber, address sender, uint256 nonce) public returns (bytes32 digest) {
		
        //the PoW must contain work that includes a recent ethereum block hash (challenge number) and the msg.sender's address to prevent MITM attacks
        digest = keccak256(challengeNumber, sender, nonce);
	}*/
	
	function mint_test(address sender, bytes32 challengeNumber, uint256 nonce, bytes32 challenge_digest, uint _miningTarget) public returns (bool success) {
		
		//the PoW must contain work that includes a recent ethereum block hash (challenge number) and the msg.sender's address to prevent MITM attacks
        bytes32 digest = keccak256(abi.encodePacked(challengeNumber, sender, nonce));
		
		//the challenge digest must match the expected
        require(digest == challenge_digest, "challenge_digest error");
		
        //the digest must be smaller than the target
        require(uint256(digest) <= _miningTarget, "miningTarget error");
        
		//only allow one reward for each challenge
        bytes32 solution = solutionForChallenge[challenge_digest];
        solutionForChallenge[challengeNumber] = digest;
        require(solution == 0x0, "solution exists");  //prevent the same answer from awarding twice
        
		uint reward_amount = getMiningReward();
        balances[sender] = balances[sender].add(reward_amount);
        _totalSupply = _totalSupply.add(reward_amount);
        //set readonly diagnostics data
        lastRewardTo = sender;
        lastRewardAmount = reward_amount;
        lastRewardEthBlockNumber = block.number;
        _startNewMiningEpoch();
        emit Mint(sender, reward_amount, epochCount, challengeNumber );
		return true;
	}
	
	
	
	uint private timeTarget = 300;  // We want miners to spend 5 minutes to mine each 'block'
	uint private N = 6180;          // N = 1000*n, ratio between timeTarget and windowTime (31-ish minutes)
									// (Ethereum doesn't handle floating point numbers very well)
	function _reAdjustDifficulty_public(uint epoch) public returns (uint) {
		
        uint elapsedTime = timeStampForEpoch[epoch.sub(1)].sub(timeStampForEpoch[epoch.sub(2)]); // will revert if current timestamp is smaller than the previous one
        
		targetForEpoch[epoch] = (targetForEpoch[epoch.sub(1)].mul(10000)).div( N.mul(3920).div(N.sub(1000).add(elapsedTime.mul(1042).div(timeTarget))).add(N));
		
        latestDifficultyPeriodStarted = block.number;
		
		/// targetForEpoch[epoch] = adjustTargetInBounds(targetForEpoch[epoch]);
		
		return targetForEpoch[epoch];
    }
	
	
	
	function _reAdjustDifficulty_Opt(uint epoch) public returns (uint) {
		
        uint elapsedTime = timeStampForEpoch[epoch.sub(1)].sub(timeStampForEpoch[epoch.sub(2)]); // will revert if current timestamp is smaller than the previous one
        
		uint s1 = uint(5180).add(elapsedTime.mul(1042).div(timeTarget));
		//uint s2 = uint(5180).add(s1); //N.sub(1000).add(s1);
		
		uint s3 = uint(24225600).div(s1).add(N); // (6180 * 3920).div(s2).add(N) = N.mul(3920).div(s2).add(N);
		
		targetForEpoch[epoch] = (targetForEpoch[epoch.sub(1)].mul(10000)).div(s3);
		
        latestDifficultyPeriodStarted = block.number;
		
		/// targetForEpoch[epoch] = adjustTargetInBounds(targetForEpoch[epoch]);
		
		return targetForEpoch[epoch];
    }
	
	
	
	function _reAdjustDifficulty_Opt2(uint epoch) public returns (uint) {
		
        uint elapsedTime = timeStampForEpoch[epoch.sub(1)].sub(timeStampForEpoch[epoch.sub(2)]); // will revert if current timestamp is smaller than the previous one
        
		uint s1 = uint(5180).add(elapsedTime.mul(1042).div(timeTarget));
		//uint s2 = uint(5180).add(s1); //N.sub(1000).add(s1);
		
		uint s3 = uint(24225600).div(s1).add(N); // (6180 * 3920).div(s2).add(N) = N.mul(3920).div(s2).add(N);
		
		targetForEpoch[epoch] = (targetForEpoch[epoch.sub(1)].div(s3)).mul(10000);
		
        latestDifficultyPeriodStarted = block.number;
		
		/// targetForEpoch[epoch] = adjustTargetInBounds(targetForEpoch[epoch]);
		
		return targetForEpoch[epoch];
    }
	
	
	
	// --- _reAdjustDifficulty test/debug function
	function _reAdjustDifficultyTest(uint epoch) public returns (uint) {
		
        // uint elapsedTime = timeStampForEpoch[epoch.sub(1)].sub(timeStampForEpoch[epoch.sub(2)]); // will revert if current timestamp is smaller than the previous one
		
		//epoch = 15516
		uint elapsedTime = 1871; //1542714528 - 1542712657; // will revert if current timestamp is smaller than the previous one
        
		///targetForEpoch[epoch] = (targetForEpoch[epoch.sub(1)].mul(10000)).div( N.mul(3920).div(N.sub(1000).add(elapsedTime.mul(1042).div(timeTarget))).add(N));
		
		//uint s1 = 6386; //1915904 / 300; //elapsedTime.mul(1042).div(timeTarget);
		//uint s2 = 11566; //5180.add(s1); //N.sub(1000).add(s1);
		
		//uint s3 = 8275; //8274.55; 2094.55 + 6180; //24225600.div(s2).add(N); // (6180 * 3920).div(s2).add(N) = N.mul(3920).div(s2).add(N);
		
		// targetForEpoch[epoch] = (targetForEpoch[epoch.sub(1)].mul(10000)).div(s3);
		//targetForEpoch[epoch] = uint(11221431935868671287606344175206342258457676483312063064495781782647827283).mul(10000).div(8275);
		
		uint s1 = uint(5180).add(elapsedTime.mul(1042).div(timeTarget));
		uint s3 = uint(24225600).div(s1).add(N);
		targetForEpoch[epoch] = uint(11221431935868671287606344175206342258457676483312063064495781782647827283).mul(10000).div(s3);
		
        latestDifficultyPeriodStarted = block.number;
		
		/// targetForEpoch[epoch] = adjustTargetInBounds(targetForEpoch[epoch]);
		
		return targetForEpoch[epoch];
    }
	
	
	
	function _reAdjustDifficultyTest2(uint epoch) public returns (uint) {
		
        // uint elapsedTime = timeStampForEpoch[epoch.sub(1)].sub(timeStampForEpoch[epoch.sub(2)]); // will revert if current timestamp is smaller than the previous one
		
		//epoch = 15516
		uint elapsedTime = 1871; //1542714528 - 1542712657; // will revert if current timestamp is smaller than the previous one
        
		///targetForEpoch[epoch] = (targetForEpoch[epoch.sub(1)].mul(10000)).div( N.mul(3920).div(N.sub(1000).add(elapsedTime.mul(1042).div(timeTarget))).add(N));
		
		//uint s1 = 6386; //1915904 / 300; //elapsedTime.mul(1042).div(timeTarget);
		//uint s2 = 11566; //5180.add(s1); //N.sub(1000).add(s1);
		
		//uint s3 = 8275; //8274.55; 2094.55 + 6180; //24225600.div(s2).add(N); // (6180 * 3920).div(s2).add(N) = N.mul(3920).div(s2).add(N);
		
		// targetForEpoch[epoch] = (targetForEpoch[epoch.sub(1)].mul(10000)).div(s3);
		//targetForEpoch[epoch] = uint(11221431935868671287606344175206342258457676483312063064495781782647827283).div(8275).mul(10000);
		
		uint s1 = uint(5180).add(elapsedTime.mul(1042).div(timeTarget));
		uint s3 = uint(24225600).div(s1).add(N);
		targetForEpoch[epoch] = uint(11221431935868671287606344175206342258457676483312063064495781782647827283).div(s3).mul(10000);
		
        latestDifficultyPeriodStarted = block.number;
		
		/// targetForEpoch[epoch] = adjustTargetInBounds(targetForEpoch[epoch]);
		
		return targetForEpoch[epoch];
    }
}