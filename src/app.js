App = {
	web3Provider: null,
	loading: false,
	contracts: {},
	//contractsDir: './build/contracts/',
	contractsDir: './',
	oldContractAddress: "0x8f7dbf90e71285552a687097220e1035c2e87639", //LIVE address
	newContractAddress: "0x73F588A77D74A3973496e23DCeF7FF1bcC989dE2", //LIVE address
	account: '0x0',
	oldContractDecimals: 4,
	newContractDecimals: 4,
	oldContractUserBalance: 0,
	newContractUserBalance: 0,
	
	load: async () => {
		console.log("loadWeb3...");
		await App.loadWeb3()
		console.log("loadAccount...");
		await App.loadAccount()
		await App.listenForAccountChange()
		console.log("loadContract...");
		await App.loadContract()
		console.log("App.oldContractDecimals: " + App.oldContractDecimals);
		console.log("App.newContractDecimals: " + App.newContractDecimals);
		console.log("loadBalances...");
		await App.loadBalances()
		console.log("render...");
		await App.render()
		//await App.showHomepage();
		console.log("end...");
	},
	
	// https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
	loadWeb3: async () => {
		if (typeof web3 !== 'undefined') {
			App.web3Provider = web3.currentProvider
			web3 = new Web3(web3.currentProvider)
		} else {
			window.alert("Please connect to Metamask.")
		}
		// Modern dapp browsers...
		if (window.ethereum) {
			window.web3 = new Web3(ethereum)
			try {
				// Request account access if needed
				await ethereum.enable()
				// Accounts now exposed
				console.log('window.ethereum => Accounts now exposed');
				///web3.eth.sendTransaction({/* ... */})
				console.log('window.ethereum => Accounts now exposed2');
			} catch (error) {
				// User denied account access...
			}
		}
		// Legacy dapp browsers...
		else if (window.web3) {
			App.web3Provider = web3.currentProvider
			window.web3 = new Web3(web3.currentProvider)
			// Accounts always exposed
			console.log('window.web3 => Accounts always exposed');
			///web3.eth.sendTransaction({/* ... */})
			console.log('window.web3 => Accounts always exposed2');
		}
		// Non-dapp browsers...
		else {
			console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
		}
	},
	
	loadAccount: async () => {
		// Set the current blockchain account
		App.account = web3.eth.accounts[0]
		console.log("App.account: " + App.account);
	},
	
	listenForAccountChangeLoopFn: async () => {
		if (web3.eth.accounts[0] !== App.account) {
			await App.loadAccount();
			await App.loadBalances();
			await App.render();
		}
	},
	
	listenForAccountChange: async () => {
		// listen for new account selected
		setInterval(() => { App.listenForAccountChangeLoopFn(); }, 1000);
	},
	
	loadContract: async () => {
		// Create a JavaScript version of the smart contract
		const contractFullPath = App.contractsDir + "_0xCatetherToken.json";
		console.log("loadContract.contractFullPath => " + contractFullPath);
		const abi = (await $.getJSON(contractFullPath)).abi;
		const catetherContract = web3.eth.contract(abi);
		App.oldContract = catetherContract.at(App.oldContractAddress);
		App.newContract = catetherContract.at(App.newContractAddress);
	},
	
	loadBalances: async () => {
		let promiseFn1 = () => {
			return new Promise((resolve, reject) => {
				App.oldContract.balanceOf.call(App.account, (err, res) => {
					if (err) {
						console.log("App.oldContract.balanceOf(" + App.account + ") ERROR: " + JSON.stringify(err));
						reject(err);
					}
					let num = res.toNumber() / Math.pow(10, App.oldContractDecimals);
					App.oldContractUserBalance = num.toFixed(App.oldContractDecimals);
					console.log('App.oldContractBalance: ' + App.oldContractUserBalance);
					resolve(App.oldContractUserBalance);
				});
			});
		};
		
		let promiseFn2 = () => {
			return new Promise((resolve, reject) => {
				App.newContract.balanceOf.call(App.account, (err, res) => {
					if (err) {
						console.log("App.newContract.balanceOf(" + App.account + ") ERROR: " + JSON.stringify(err));
						reject(err);
					}
					let num = res.toNumber() / Math.pow(10, App.newContractDecimals);
					App.newContractUserBalance = num.toFixed(App.newContractDecimals);
					console.log('App.newContractBalance: ' + App.newContractUserBalance);
					resolve(App.newContractUserBalance);
				});
			});
		};
		
		try {
			await promiseFn1();
			await promiseFn2();
		} catch(err) {
			console.log("loadBalances err: " + err.toString());
		}
	},
	
	renderAccount: async () => {
		// Render Account
		$('#accountAddress').html(App.account)
	},
	
	renderBalances: async () => {
		// Render balances
		//$('.old-token-balance').val(App.oldContractUserBalance.toString()); //this is for input text field
		$('.old-token-balance').html(App.oldContractUserBalance);
		$('.new-token-balance').html(App.newContractUserBalance);
	},
	
	render: async () => {
		// Prevent double render
		if (App.loading) {
			return
		}
		
		// Update app loading state
		App.setLoading(true)
		
		// Render Account
		App.renderAccount()
		
		// Render balances
		App.renderBalances()
		
		// Update loading state
		App.setLoading(false)
	},
	
	setLoading: (boolean) => {
		App.loading = boolean
		const loader = $('#loader')
		const content = $('#content')
		const loaderpanel = $('#loaderpanel')
		
		if (boolean) {
			loader.show()
			content.hide()
		} else {
			loader.hide()
			content.show()
		}
	},
	
	updateLastTx: async (tx_hash) => {
		let tx_link = 'https://etherscan.io/tx/' + tx_hash;
		console.log('updateLastTx >> ' + tx_link);
		
		$('.last-tx-info').prop('hidden', false);
		$('.last-tx-link')
		.prop('text', tx_hash)
		.prop('href', tx_link);
	},
	
	/*test_updateLastTx: async () => {
		let hash = '0x79fb4fbdfe33491ff00e6c9aa8bf117e7465de725612193edea852c65953b75b';
		await App.updateLastTx(hash);
	},*/
	
	migrateTokens: async () => {
		var migrateTkn = new Promise((resolve, reject) => {
			//let raw_tokens = $('.old-token-balance').val() * Math.pow(10, App.oldContractDecimals); //this is for input text field
			let raw_tokens = App.oldContractUserBalance * Math.pow(10, App.oldContractDecimals);
			let no_bytes_data = "";
			let tx_receipt;
			
			console.log('***migrateTokens.App.newContractAddress: ' + App.newContractAddress);
			console.log('***migrateTokens.raw_tokens: ' + raw_tokens);
			App.oldContract.approveAndCall(App.newContractAddress, raw_tokens, no_bytes_data, {from: App.account, gas: 150000},
			(err, res) => {
				if (err) {
					var err1 = "App.oldContract.approveAndCall(" + App.newContractAddress + ", " + raw_tokens + ") ERROR: " + JSON.stringify(err);
					console.log(err1);
					reject(err1);
				}
				resolve(res);
			});
			/// the following code with listening on events does not work with metamask
			/*.on('transactionHash', function(hash) {
				console.log('App.oldContract.approveAndCall transactionHash: ' + hash);
				App.updateLastTx(hash);
			})
			.on('receipt', function(receipt) {
				console.log('App.oldContract.approveAndCall receipt: ' + JSON.stringify(receipt));
				tx_receipt = receipt;
			})
			.on('confirmation', function(confirmationNumber, receipt) {
				console.log('App.oldContract.approveAndCall confirmation >> ');
				console.log('confirmationNumber: ' + confirmationNumber);
				if (confirmationNumber === 5) {
					resolve(tx_receipt);
				}
			})
			.on('error', function(err) {
				let err1 = 'App.oldContract.approveAndCall err: ' + err.toString();
				console.log(err1);
				reject(err1);
			});*/
			
			/*App.oldContract.approveAndCall(App.newContractAddress, App.oldContractUserBalance, new String(""),
			{from: App.account,
			 value: 0,
			 gas: 50000 // Gas limit
			},
			(err, res) => {
				if (err) {
					var err1 = "App.oldContract.approveAndCall(" + App.newContractAddress + ", " + App.oldContractUserBalance + ") ERROR: " + JSON.stringify(err);
					//console.log(err1);
					reject(err1);
				}
				resolve(res);
			});*/
		});
		
		try {
			let tx = await migrateTkn;
			console.log('***migrateTkn return >>');
			console.log(JSON.stringify(tx));
			await App.updateLastTx(tx);
			await App.loadBalances();
			await App.render();
		} catch(err) {
			console.log('migrateTokens err: ' + err.toString());
		}
	},
}

$(() => {
	$(window).load(() => {
		App.load()
	})
})