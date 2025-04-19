# Supernet Validator Node Guide

This guide was created using **Ubuntu 24.0.4 LTS** as the base operating system. While any *nix-based system should work, these instructions are tailored for Ubuntu.

---

## Prerequisites

- A wallet with **5 $POL ($MATIC)** & **(250,010 $CHAIN)** on Polygon mainnet.
  - This wallet will be referred to as the **Primary Wallet**.
- A dedicated Polygon RPC node from a provider like [Alchemy](https://www.alchemy.com). You can sign up for a free account.

---

## Hardware Requirements

| Component   | Minimum Requirement | Recommended |
|------------|-------------------|-------------|
| Processor  | 4-core CPU        | 8-core CPU  |
| Memory     | 8 GB RAM          | 16 GB RAM   |
| Storage    | 160 GB SSD        | 1 TB SSD    |
| Network    | High-speed internet connection | Dedicated server with gigabit connection |
| OS         | Ubuntu LTS        | Ubuntu LTS  |

---

## Technical Requirements

When setting up the **Supernet Validator Node**, you need the following dependencies:

- [Node.js 18.20.x & npm](https://nodejs.org/en/)
- [Go 1.20.x](https://go.dev/dl/)
- [jq](https://jqlang.github.io/jq)
- [Netcat](https://nmap.org/ncat/)

### General Dependencies
```bash
sudo apt update
sudo apt install -y curl vim netcat-traditional jq screen psmisc
```

### Install Node.js & npm
```bash
sudo apt install -y nodejs npm
```
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```
```bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```
```bash
nvm install 18
```
```bash
nvm use 18
```

### Install Go
```bash
wget https://dl.google.com/go/go1.20.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.20.linux-amd64.tar.gz
```

### Update `~/.bashrc`
Append the following lines at the end of the file:
```bash
export GOPATH=$HOME/go
export GOROOT=/usr/local/go
export PATH=$PATH:/usr/local/go/bin
```
```bash
source ~/.profile
go version
```

---

## Setting Up the Validator Node Repository

> **⚠ Warning**: The `genesis.json` file is crucial for running the node correctly. Do not modify it except for RPC changes.

```bash
git clone https://github.com/Chain-Games/supernet-validator-node.git
cd supernet-validator-node
npm install
```

### Configure `genesis.json`

Replace the `jsonRPCEndpoint` value with your **Polygon Mainnet RPC URL** from Alchemy (or another provider).
```json
"jsonRPCEndpoint": "your-rpc-here"
```

### Update `.env` Files

Modify the following files to include your **Polygon Mainnet RPC URL** and **Primary Wallet Private Key**:
- `./.env`
- `./scripts/.env`

---

## Setting Up the Validator

### Step 1: Install Validator
```bash
sudo ./scripts/addValidator
```

### Step 2: Start Validator Node

You have 2 options for starting the validator node.  

Option 1 is to run it locally using the local binary. (Preferred)
Option 2 is to run it from a Docker container.

Only choose one option and follow those instructions.  Don't perform both options.

#### **Option 1: Run Validator Node using Local Binary (Preferred)**
```bash
sudo screen ./scripts/start
```
Check if the process is running:
```bash
ps ax | grep polygon
```
Example output:
```bash
./polygon-edge server --data-dir ./test-chain-5 --chain ./genesis.json --grpc-address :10000 --libp2p 0.0.0.0:30301 --jsonrpc :10002 --relayer --num-block-confirmations 2 --seal --log-level INFO
```
If **screen terminates**, run:
```bash
sudo ./scripts/start
```

#### **Option 2: Run Validator Node using Docker**

### Install Docker
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

### Add Docker Repository
```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

### Install Docker Tools
```bash
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Verify Docker Installation
```bash
sudo docker run hello-world
```

### Build & Run Validator Node with Docker
```bash
sudo docker build -t validator5 .
sudo docker run -d --name validator5 -it -p 10000:10000 -p 30301:30301 -p 10002:10002 validator5:latest /bin/fish
sudo docker exec -it validator5 /bin/fish
```

### Start Validator Node Inside Docker
```bash
sudo screen ./scripts/start
```

---

## Docker Helper Commands

### Access Running Docker Container
```bash
sudo docker exec -it validator5 /bin/fish
```

### Check Running Validator Node Process
```bash
ps ax | grep polygon
```
Example output:
```bash
./polygon-edge server --data-dir ./test-chain-5 --chain ./genesis.json --grpc-address :10000 --libp2p 0.0.0.0:30301 --jsonrpc :10002 --relayer --num-block-confirmations 2 --seal --log-level INFO
```

### Stop Running Validator Node Process
```bash
sudo killall polygon-edge
```

---

## Supernet Validator Node Helpers

### Retrieve Node Validator Private Key
> **⚠ Warning**: The validator.key file is your node's private key.  DON'T LOSE IT or you will lose access to your stake.  Back this key up.  You can also add it to your MetaMask or any other EVM wallet as well to have another instance of it.

```bash
sudo cat ./test-chain-5/consensus/validator.key
```

### Set Validator Name & Image
```bash
node setValidatorInfo.js <validator-private-key> <validator-name-here> " " <full-path-to-image.png>
```
Example:
```bash
node setValidatorInfo.js validatorPrivateKey CG-Validator " " /root/chaingames.png
```

### Set Validator Commission Rate
```bash
node updateCommissionRate.js <pk> <amount-in-percentage>
```
Example (2% commission):
```bash
node updateCommissionRate.js validatorPrivateKey 2
```

---

**🎉 Congratulations! Your Supernet Validator Node is now set up!**
