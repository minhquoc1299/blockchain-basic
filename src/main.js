const {Blockchain, Transactions} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myPrivateKey = ec.keyFromPrivate('63963967367c2c08b4d6b3be9099bbdf3208f5dfbfbd04bd44f4ce50ebc130cc');
const myWalletAddress = myPrivateKey.getPublic('hex');

let blockChain = new Blockchain();

// Transaction one
let transactionOne = new Transactions(myWalletAddress, "Address Two", 10);
transactionOne.signTransaction(myPrivateKey);
blockChain.addTransaction(transactionOne);

// Mining
console.log("Starting the miner....");
blockChain.minePendingTransactions(myWalletAddress);

console.log("Balance of address tmquoc-address: ", blockChain.getBalanceAddress(myWalletAddress), " coin");

