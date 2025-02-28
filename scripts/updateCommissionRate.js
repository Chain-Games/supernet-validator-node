require("dotenv").config()
const { ethers } = require("ethers")
const STAKEMANAGER_ABI = require("./abi/stakeManager.json")

const maticProvider = new ethers.providers.JsonRpcProvider(process.env.RPC);
let validatorPrivateKey = process.argv[2]
const signer = new ethers.Wallet(validatorPrivateKey, maticProvider)
const stakeManagerContract = new ethers.Contract(process.env.STAKEMANAGERADDRESS, STAKEMANAGER_ABI, signer)

async function updateCommisionRate(amount) {

    const validatorAddress = new ethers.Wallet(validatorPrivateKey).address

    let validatorId = await stakeManagerContract.functions.getValidatorIdFromValidatorAddress(validatorAddress)

    let data = stakeManagerContract.interface.encodeFunctionData("updateCommissionRate", [validatorId, amount]);
    let transaction = {
        to: process.env.STAKEMANAGERADDRESS,
        data: data,
        gasLimit: 300000,
        gasPrice: 50000000000
    }
    let txHash = await signer.sendTransaction(transaction)
        .then(async (txDetails) => {
            console.log("txDetails: ", txDetails)
            await txDetails.wait()
            return txDetails.hash
        })
        .catch((err) => {
            throw new Error(`Error in sendTransaction : ${JSON.stringify(err)}`)
        })
    console.log("🚀 ~ updateCommisionRate ~ txHash:", txHash)
}

updateCommisionRate(process.argv[3]);