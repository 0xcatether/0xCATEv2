App = {
	loading: false,
	contracts: {},
	//contractsDir: './build/contracts/',
	contractsDir: './',
	contractAddress: "0x8f7dbf90e71285552a687097220e1035c2e87639", //LIVE address
	
	load: async () => {
		console.log("loadWeb3...");
		await App.loadWeb3()
		console.log("loadAccount...");
		await App.loadAccount()
		await App.listenForAccountChange()
		console.log("loadContract...");
		await App.loadContract()
		console.log("render...");
		await App.render();
		await App.showHomepage();
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
	
	listenForAccountChange: async () => {
		// listen for new account selected
		setInterval(() => {
			if (web3.eth.accounts[0] !== App.account) {
				App.account = web3.eth.accounts[0];
				App.loadAccount();
				App.renderAccount();
			}
		}, 1000);
	},
	
	loadContract: async () => {
		//return;
		
		// Create a JavaScript version of the smart contract
		const contractFullPath = App.contractsDir + "_0xCatetherToken.json";
		console.log("loadContract.contractFullPath => " + contractFullPath);
		const abi = (await $.getJSON(contractFullPath)).abi;
		const catetherContract = web3.eth.contract(abi); //, contractAddress);
		App.catetherContract = catetherContract.at(App.contractAddress);
		//App.catetherContract.Mint(App.MintEventCallback);
		
		App.mintEvent = App.catetherContract.Mint({}, {fromBlock: 6739227, toBlock: 'latest'});
		App.mintEvent.watch(App.MintEventCallback);
	},
	
	renderAccount: async () => {
		// Render Account
		$('#account').html(App.account)
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
			loaderpanel.prop('hidden', false)
			loaderpanel.show()
		} else {
			loader.hide()
			content.show()
			loaderpanel.hide()
		}
	},
	
	//event Mint(address indexed from, uint reward_amount, uint epochCount, bytes32 newChallengeNumber);
	MintEventCallback: async (err, res) => {
		if (err) {
			console.log("***MintEventCallback err: " + JSON.stringify(err));
			return;
		}
		var from = res.args.from;
		var reward_amount = res.args.reward_amount;
		var epochCount = res.args.epochCount;
		var newChallengeNumber = res.args.newChallengeNumber;
		console.log("---MintEventCallback >>");
		console.log("\nfrom: " + from);
		console.log("\nreward_amount: " + reward_amount);
		console.log("\nepochCount: " + epochCount);
		console.log("\nnewChallengeNumber: " + newChallengeNumber + "\n");
	}
}

$(() => {
	$(window).load(() => {
		App.load()
	})
})