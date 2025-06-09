const axios = require("axios");
require("dotenv").config();

export async function updateValidatorMetaData(validatorAddress) {
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
      url: `${backendUrl}/api/validator/create-or-update-validator-metadata`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        validatorWalletAddress: validatorAddress,
      },
    });
  } catch (error) {
    console.error(
      `An error occurred while updating validator metadata for address: ${validatorAddress}`,
      error
    );
  }
}
