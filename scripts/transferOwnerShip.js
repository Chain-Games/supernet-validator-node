require("dotenv").config();
const ethers = require('ethers');

async function main() {
  // const provider = new ethers.providers.JsonRpcProvider("https://mumbai-rpc.chaingames.io?key=MInPWoME0hX64a24Z703yuet");
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC);
  //pk of owner
  const pk = process.argv[2]
  const stakingContractAddress = process.argv[3]
  const validatorAddress = process.argv[4]
  const signer = new ethers.Wallet(pk, provider);

  const abi = [
    "function predicate() external view returns (address)",
    "function rootToken() external view returns (address)",
    "function decimals() public view returns (uint8)",
    "function transferOwnership(address newOwner) public virtual onlyOwner",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function getValidatorIdFromValidatorAddress(address validator) public view returns(uint256)"
  ]

  //staking nft contract address
  const contract = new ethers.Contract(stakingContractAddress, abi, signer)

  try {
    //address of newOwner
    const sig = contract.interface.encodeFunctionData("transferOwnership", [validatorAddress]);
    console.log("Transferring  Ownership ...")
    const data = await signer.sendTransaction({
      from : signer.address,
      to : stakingContractAddress,
      data : sig,
      gasPrice : 27000000000
    })
    console.log("🚀 ~ main ~ data:", data)
    // const rootTokenAddress = await contract.transferOwnership(validatorAddress);
    // console.log("rootTokenAddress:", rootTokenAddress)
  }
  catch (e) {
    console.log("Error =", e)
  }
  //const balance = await contract.getBalance("0x5D8b7a718887576668cc25683d543D29A6b91282")

}

main();