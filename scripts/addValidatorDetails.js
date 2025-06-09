const axios = require("axios");
require("dotenv").config();

const validatorAddress = process.argv[2];

async function addValidatorData() {
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

    console.log(
      `Starting to add validator data for address: ${validatorAddress}`
    );

    const { data: validatorData } = await axios({
      method: "POST",
      url: `${backendUrl}/api/validator/create-or-update-validator`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        validatorWalletAddress: validatorAddress,
      },
    });
    console.log("Validator data successfully added:", validatorData);

    console.log("Updating overview data...");
    const { data: overviewData } = await axios({
      method: "POST",
      url: `${backendUrl}/api/overview/create-or-update-overview`,
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Overview data successfully updated:", overviewData);
  } catch (error) {
    console.error("An error occurred while adding validator data:", error);
  }
}

addValidatorData();
