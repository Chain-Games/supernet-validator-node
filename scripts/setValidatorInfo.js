import "dotenv/config";
import FormData from "form-data";
import { readFileSync, writeFileSync } from "fs";
import axios from "axios";
import { ethers, parseUnits, formatUnits } from "ethers";
import STAKEMANAGER_ABI from "./abi/stakeManager.json" with { type: "json" };
import { updateValidatorMetaData } from "./updateValidatorMetaData.js";

// ---- Args ----
const validatorPrivateKey = process.argv[2];
const validatorName = process.argv[3];
const validatorLink = process.argv[4];
let validatorLogoPath = process.argv[5];

if (!validatorPrivateKey || !validatorName || !validatorLink || !validatorLogoPath) {
  console.error("❌ Usage: node setValidatorMetadata.js <PRIVATE_KEY> <NAME> <LINK> <LOGO_PATH>");
  process.exit(1);
}

// ---- Constants ----
const validatorAddress = new ethers.Wallet(validatorPrivateKey).address;
const IPFS_URL = "https://chaingames.infura-ipfs.io/ipfs/";
const IPFS_CLIENT = "https://ipfs.infura.io:5001/api/v0/add";
const auth = "Basic " + Buffer.from(`${process.env.PROJECT_ID}:${process.env.PROJECT_SECRET}`).toString("base64");

const jsonData = {
  name: validatorName,
  link: validatorLink,
  address: validatorAddress,
  logo: validatorLogoPath,
};

async function uploadToIPFS(fileBuffer, filename) {
  const formData = new FormData();
  formData.append("file", fileBuffer, { filename });

  const response = await axios.post(IPFS_CLIENT, formData, {
    headers: {
      ...formData.getHeaders(),
      Authorization: auth,
    },
  });

  return IPFS_URL + response.data.Hash;
}

async function main() {
  try {
    console.log("🔐 Validator Address:", validatorAddress);

    // Upload logo
    console.log("🖼️  Uploading validator logo to IPFS...");
    const imageBuffer = readFileSync(validatorLogoPath);
    const logoURI = await uploadToIPFS(imageBuffer, validatorAddress + ".jpg");
    console.log("✅ Logo uploaded:", logoURI);
    jsonData.logo = logoURI;

    // Upload metadata JSON
    const jsonFilePath = "validator_metadata.json";
    writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), "utf8");
    const jsonFileBuffer = readFileSync(jsonFilePath);
    console.log("📦 Uploading metadata JSON to IPFS...");
    const metaDataURI = await uploadToIPFS(jsonFileBuffer, validatorAddress + ".json");
    console.log("✅ Metadata URI:", metaDataURI);

    // Blockchain setup
    const provider = new ethers.JsonRpcProvider(process.env.RPC);
    const signer = new ethers.Wallet(validatorPrivateKey, provider);
    const stakeManagerContract = new ethers.Contract(
      process.env.STAKEMANAGERADDRESS,
      STAKEMANAGER_ABI,
      signer
    );

    // Get validator ID
    const validatorIdRaw = await stakeManagerContract.getValidatorIdFromValidatorAddress(validatorAddress);
    const validatorId = validatorIdRaw.toString();
    console.log("🆔 Validator ID:", validatorId);

    // Prepare transaction data manually for gas estimation
    const txData = stakeManagerContract.interface.encodeFunctionData("setValidatorMetaDataURI", [
      validatorId,
      metaDataURI,
    ]);

    const estimatedGas = await provider.estimateGas({
      to: process.env.STAKEMANAGERADDRESS,
      from: validatorAddress,
      data: txData,
    });

    const gasLimit = estimatedGas * 110n / 100n;

    // Fetch fee data
    const feeData = await provider.getFeeData();
    const maxPriorityFeePerGas = parseUnits("30", "gwei");
    const baseFee = feeData.lastBaseFeePerGas ?? parseUnits("30", "gwei");
    const maxFeePerGas = baseFee + maxPriorityFeePerGas;

    console.log("⛽ Gas Fees:");
    console.log("   Base Fee:", formatUnits(baseFee, "gwei"), "gwei");
    console.log("   Priority Fee:", formatUnits(maxPriorityFeePerGas, "gwei"), "gwei");
    console.log("   Max Fee:", formatUnits(maxFeePerGas, "gwei"), "gwei");
    console.log("   Estimated Gas Limit:", gasLimit.toString());

    // Send transaction
    const tx = await stakeManagerContract.setValidatorMetaDataURI(validatorId, metaDataURI, {
      maxPriorityFeePerGas,
      maxFeePerGas,
      gasLimit,
    });

    console.log("🚀 Transaction submitted:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    await updateValidatorMetaData(validatorAddress);
    console.log("✅ Validator Metadata updated!")

  } catch (error) {
    console.error("❌ Error:", error.message || error);
  }
}

main();
