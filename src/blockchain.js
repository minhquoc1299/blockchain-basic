const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transactions {
    constructor(fromAddress, toAddress, amount = 0) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    caculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTransaction = this.caculateHash();
        const sign = signingKey.sign(hashTransaction, 'base64');
        this.signature = sign.toDER('hex');
        console.log("this.signature: " + this.signature);
    }

    isValid() {
        if (this.fromAddress === null) return true;

        console.log("this.signature is valid: " + this.signature);

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.caculateHash(), this.signature);
    }
}

class Block {
    constructor(timestamp, transactions, perviousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.perviousHash = perviousHash;
        this.hash = this.caculateHash();
        this.nonce = 0;
    }

    caculateHash() {
        return SHA256(this.perviousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    miningBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.caculateHash();
        }
        console.log("Block mined: ", this.hash);
    }

    hasValidTransaction() {
        for (const transaction of this.transactions) {
            if (!transaction.isValid()) {
                return false;
            }
        }
        return true;
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenerisBlock()];
        this.pendingTransactions = [];
        this.miningReward = 100;
        this.difficulty = 4;
    }

    createGenerisBlock() {
        return new Block(0, "01/01/2023", "Generis First Block", "0");
    }

    getLastestBlock() {
        let lenght = this.chain.length;
        return this.chain[lenght - 1];
    }

    minePendingTransactions(mineRewardAddress) {
        const rewardTransaction = new Transactions(null, mineRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTransaction);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLastestBlock().hash);
        block.miningBlock(this.difficulty);

        console.log("Block successfully mined!!!");
        this.chain.push(block);

        this.pendingTransactions = [];

    }

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address!');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain!');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceAddress(address) {
        let balance = 0;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance = balance - trans.amount;
                }
                if (trans.toAddress === address) {
                    balance = balance + trans.amount;
                }
            }
        }
        return balance;
    }

    isChainValid() {
        let length = this.chain.length;
        for (let i = 1; i < length; i++) {
            let currentBlock = this.chain[i];
            let perviousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransaction()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.caculateHash()) {
                console.log("currentBlock.hash:", currentBlock.hash);
                console.log("currentBlock.caculateHash():", currentBlock.caculateHash());
                return false;
            }
            if (currentBlock.perviousHash !== perviousBlock.hash) {
                console.log("currentBlock.hash:", currentBlock.hash);
                console.log("perviousBlock.hash:", perviousBlock.hash);
                return false;
            }
            return true;
        }
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transactions = Transactions;