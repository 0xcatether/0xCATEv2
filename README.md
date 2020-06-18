# 0xCATE token smart contract
Introducing "Proof of use" concept aiming to lower transaction cost by rewarding the transaction sender with 0xcate tokens.

# Tools we need to develop and unit test
*truffle framework
*ganache-cli for local blockchain testing
*nodejs
*npm
Note: check package.json file for dependencies.

# Steps for setup
1. Install truffle module
 npm install truffle [--save-dev]
 2. Install ganache-cli for local blockchain testing
  npm install ganache-cli
2. truffle init
 Go to project folder for this.
3. have truffle.js file renamed to truffle-config.js and edit this file as you need.

# Steps to use when developing and testing
1. Compile:
	truffle compile [--all]
2. Migrate contract to local blockchain:
	truffle migrate --reset
3. run unit test scripts (javascript unit testing):
	truffle test [specific_file]
