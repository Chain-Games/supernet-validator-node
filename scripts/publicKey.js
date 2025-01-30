const ethers = require("ethers");
const provider = new ethers.providers.JsonRpcProvider("https://polygon-amoy.g.alchemy.com/v2/VdlVc2gQ1RE6mkMWbZkNrqkv5Rs7tBqq")
//pk of validators
const pk = process.argv[2]
const wallet = new ethers.Wallet(pk, provider)

const publicKey = wallet.publicKey
//remove 0x04 from the begining of o/p
console.log(publicKey.slice(4)) 