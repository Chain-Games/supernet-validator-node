const axios = require("axios")
const backendUrl = "https://bridge-backend.chaingames.io"
const validatorAddress = process.argv[2];

async function transferOwnership(address) {
    const { data } = await axios({
        method : "POST",
        url : `${backendUrl}/whitelist-validator`,
        headers : {
            "Content-Type" : "application/json"
        },
        data : {
            validatorAddress : address
        }
    })
    console.log("WhiteList Validator :", data)
}

transferOwnership(validatorAddress);