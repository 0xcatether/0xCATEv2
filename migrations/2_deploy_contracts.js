const ERC20Token = artifacts.require("./ERC20Token.sol");
const CateToken_v2 = artifacts.require("./_0xCatetherToken");
const CateToken_v2_mock = artifacts.require("./_0xCatetherToken_mock");

var tokenSymbol = '0xCATE';
var tokenName = '0xCatether Token';
var tokens = 500000000;

module.exports = function(deployer) {
	deployer.deploy(ERC20Token, tokens)
	.then(() => {
		return deployer.deploy(CateToken_v2)
	})
	.then(() => {
		return deployer.deploy(CateToken_v2_mock, ERC20Token.address)
	});
};
