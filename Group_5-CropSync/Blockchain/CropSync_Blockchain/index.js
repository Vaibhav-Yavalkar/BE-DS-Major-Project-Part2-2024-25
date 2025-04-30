const Web3 = require('web3');
const contract = require('./build/contracts/FarmerRegistration.json');

const web3 = new Web3('http://127.0.0.1:7545');
const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; 
const farmerContract = new web3.eth.Contract(contract.abi, contractAddress);

async function registerFarmer() {
    const accounts = await web3.eth.getAccounts();
    await farmerContract.methods.registerFarmer("John Doe", "India", 10).send({ from: accounts[0] });
    console.log("Farmer Registered!");
}

registerFarmer();
