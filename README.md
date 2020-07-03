# 0xCATE token smart contract
Introducing "Proof of use" concept aiming to lower transaction cost by rewarding the transaction sender with 0xcate tokens.

# Tools we need to develop and unit test
-truffle framework\
-ganache-cli for local blockchain testing\
-nodejs\
-npm\
Note: check package.json file for dependencies.

# To test web server on local PC, install dependencies and run with lite-server:
1. install nodejs dependencies only the first time
```
 npm install
```
2. Run web server on local PC in development mode
```
 npm run dev
```
Note: Default web browser will open a tab with website on localhost:3000

# Steps for setup
1. Install truffle module
 ```
 npm install -g truffle [--save-dev]
 ```
2. Install [ganache](http://truffleframework.com/ganache/) for local blockchain testing
  or install package via npm command
  ```
  npm install -g ganache-cli
  ```
3. Go to project folder to init a new truffle project
 ```
 truffle init
 ```
4. have truffle.js file renamed to truffle-config.js and edit this file as you need.

# Steps to use when developing and testing
1. Compile:
 ```
 truffle compile [--all]
 ```
2. Migrate contract to local blockchain:
 ```
 truffle migrate --reset
 ```
3. run unit test scripts (javascript unit testing):
 ```
 truffle test [specific_file]
 ```

# Optional tools
 truffle-flattener is useful when having multiple inheritance contracts and we want to flatten contracts into a single file for deployment or just verify contract code on etherscan with a single file.\
1. Install truffle-flattener:
 ```
 npm install -g truffle-flattener
 ```
2. How to use:
 ```
 truffle-flattener MyContract.sol > MyContract_flattened.sol
 ```

# License
This project is licensed under the terms of the MIT license.
