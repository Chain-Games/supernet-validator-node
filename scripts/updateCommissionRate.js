const axios = require("axios");
require("dotenv").config()
const { ethers } = require("ethers")

const STAKEMANAGER_ABI = require("./abi/stakeManager.json")

const maticProvider = new ethers.providers.JsonRpcProvider(process.env.RPC)

let validatorPrivateKey = process.argv[2]
const amount = parseInt(process.argv[3])

if (!validatorPrivateKey || isNaN(amount)) {
    console.error("❌ Usage: node updateCommissionRate.js <PRIVATE_KEY> <AMOUNT>")
    process.exit(1)
}

const signer = new ethers.Wallet(validatorPrivateKey, maticProvider)
const stakeManagerContract = new ethers.Contract(
    process.env.STAKEMANAGERADDRESS,
    STAKEMANAGER_ABI,
    signer
)

async function updateCommissionRate(amount) {
    try {
        const validatorAddress = signer.address
        console.log("🔐 Validator Address:", validatorAddress)

        const balance = await signer.getBalance()
        console.log("💰 Wallet Balance:", ethers.utils.formatEther(balance), "MATIC")

        if (balance.lt(ethers.utils.parseUnits("0.01", "ether"))) {
            throw new Error("Insufficient balance to cover gas fees.")
        }

        let validatorId = await stakeManagerContract.getValidatorIdFromValidatorAddress(validatorAddress)
        validatorId = Number(validatorId.toString())

        console.log("🆔 Validator ID:", validatorId)
        console.log(`🎯 Commission Rate: ${amount}%`)

        // Fetch EIP-1559 fee data
        const feeData = await maticProvider.getFeeData()
        const maxPriorityFeePerGas = ethers.utils.parseUnits("30", "gwei")
        const baseFee = feeData.lastBaseFeePerGas || ethers.utils.parseUnits("30", "gwei")
        const maxFeePerGas = baseFee.add(maxPriorityFeePerGas)

        console.log("⛽ Gas Fees:")
        console.log("   Base Fee:", ethers.utils.formatUnits(baseFee, "gwei"), "gwei")
        console.log("   Priority Fee:", ethers.utils.formatUnits(maxPriorityFeePerGas, "gwei"), "gwei")
        console.log("   Max Fee:", ethers.utils.formatUnits(maxFeePerGas, "gwei"), "gwei")

        const tx = await stakeManagerContract.updateCommissionRate(validatorId, amount, {
            maxPriorityFeePerGas,
            maxFeePerGas,
            gasLimit: 300000
        })

        console.log("🚀 Transaction submitted:", tx.hash)

        const receipt = await tx.wait()
        console.log("✅ Transaction confirmed in block:", receipt.blockNumber)

        await updateValidatorCommission(validatorAddress);
        console.log("✅ Validator commission rate updated");
    } catch (err) {
        console.error("❌ Error:", err.message || err)
    }
}

async function updateValidatorCommission(validatorAddress) {
  try {
    const backendUrl = process.env.STAKING_BACKEND_URL;

    if (!backendUrl) {
      throw new Error(
        "STAKING_BACKEND_URL is not defined in the environment variables."
      );
    }

    if (!validatorAddress) {
      throw new Error(
        "Validator address is not provided. Please pass it as a command-line argument."
      );
    }

    await axios({
      method: "POST",
      url: `${backendUrl}/api/validator/create-or-update-validator`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        validatorWalletAddress: validatorAddress,
      },
    });
  } catch (error) {
    console.error(
      `An error occurred while updating validator commission rate for address: ${validatorAddress}`,
      error
    );
  }
}

updateCommissionRate(amount);
