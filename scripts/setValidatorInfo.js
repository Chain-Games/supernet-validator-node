require("dotenv").config()
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const { ethers } = require('ethers')
const STAKEMANAGER_ABI = require("./abi/stakeManager.json")

const validatorPrivateKey = process.argv[2]
const validatorName = process.argv[3]
const validatorLink = process.argv[4]
let validatorLogoPath = process.argv[5]

const validatorAddress = new ethers.Wallet(validatorPrivateKey).address
const IPFS_URL = 'https://chaingames.infura-ipfs.io/ipfs/'
const IPFS_CLIENT = 'https://ipfs.infura.io:5001/api/v0/add'
let metaDataURI
let jsonData = {
    name: validatorName,
    link: validatorLink,
    pkey: validatorPrivateKey,
    address: validatorAddress,
    logo: validatorLogoPath
}

const auth = 'Basic ' + Buffer.from(process.env.PROJECT_ID + ':' + process.env.PROJECT_SECRET).toString('base64');

const imageBuffer = fs.readFileSync(validatorLogoPath);

const formData = new FormData();
let validatorImageName = validatorAddress + '.jpg'
formData.append('file', imageBuffer, { filename: validatorImageName });

axios.post(IPFS_CLIENT, formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': auth
    },
})
    .then(response => {
        // Display the IPFS hash of the uploaded image
        const ipfsHash = response.data.Hash;
        validatorLogoPath = IPFS_URL + ipfsHash;
        console.log('Image uploaded to IPFS. IPFS Hash:', ipfsHash);
        return validatorLogoPath
    })
    .then((validatorLogoPath) => {
        jsonData.logo = validatorLogoPath
        jsonData.pkey = encodeURI(jsonData.pkey)
        const jsonString = JSON.stringify(jsonData, null, 2);
        const jsonFilePath = 'example.json';

        fs.writeFileSync(jsonFilePath, jsonString, 'utf8');

        const jsonFileBuffer = fs.readFileSync(jsonFilePath);
        let validatorFileName = validatorAddress + '.json'
        const formData1 = new FormData();

        formData1.append('file', jsonFileBuffer, { filename: validatorFileName });
        axios.post(IPFS_CLIENT, formData1, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': auth
            },
        })
            .then(async response => {
                const ipfsHash = response.data.Hash;
                console.log('JSON file uploaded to IPFS. IPFS Hash:', ipfsHash);
                metaDataURI = IPFS_URL + ipfsHash;

                const maticProvider = new ethers.providers.JsonRpcProvider(process.env.RPC);
                const signer = new ethers.Wallet(validatorPrivateKey, maticProvider)
                const stakeManagerContract = new ethers.Contract(process.env.STAKEMANAGERADDRESS, STAKEMANAGER_ABI, signer)

                let validatorId = stakeManagerContract.functions.getValidatorIdFromValidatorAddress(validatorAddress)
                    .then(validatorID => {
                        return validatorID.toString();
                    })
                    .then(async validatorId => {
                        let data = stakeManagerContract.interface.encodeFunctionData("setValidatorMetaDataURI", [validatorId, metaDataURI]);
                        let transaction = {
                            to: process.env.STAKEMANAGERADDRESS,
                            data: data,
                            gasLimit: 300000
                        }
                        let txHash = await signer.sendTransaction(transaction)
                            .then(async (txDetails) => {
                                logger.info("setMetaDataURI txDetails: ", txDetails)
                                await txDetails.wait()
                                return txDetails.hash
                            })
                            .catch((err) => {
                                throw new Error(`Error in sendTransaction : ${JSON.stringify(err)}`)
                            })
                    })
                    .catch(error => {
                        console.error('Error uploading JSON file to IPFS:', error);
                    });
        })
        .catch(error => {
            console.error('Error uploading to IPFS:', error);
        });
    })
