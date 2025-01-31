# Supernet Validator Node guide

## Prerequisites
* A Wallet with `5 MATIC` & `(250k + 10) CHAIN` on Polygon mainnet. We will refer to this wallet as `Primary Wallet`.

## Technical
When starting to setup  `supernet validator node` , there are some additional dependencies:
* [NodeJs & npm](https://nodejs.org/en/)
* [go 1.20.x](https://go.dev/dl/)
* [jq](https://jqlang.github.io/jq)
* Netcat (nc)

### General Dependencies
```
sudo apt update

sudo apt install curl -y

sudo apt install vim -y

sudo apt install netcat-traditional -y

sudo apt install jq -y

sudo apt install screen -y

sudo apt install psmisc -y
```
### NodeJs
```
sudo apt install nodejs

sudo apt install npm

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```
### Go
```
wget https://dl.google.com/go/go1.20.linux-amd64.tar.gz

sudo tar -C /usr/local -xzf go1.20.linux-amd64.tar.gz

# Open ~/.bashrc file and paste following 3 lines at the end.
export GOPATH=$HOME/go
export GOROOT=/usr/local/go
export PATH=$PATH:/usr/local/go/bin

source ~/.profile

go version
```

<br>
<hr>
<br>

# Setting Up the Validator Node Repository
#### [ Warning ] - `genesis.json` is very crucial file for running the node correctly, do not make any changes to it except for RPC changes.
```
git clone git@github.com:kr-advait/supernet-validator-node.git

cd supernet-validator-node

npm install
```

### 1 - Open genesis.json file and configure your polygon mainnet rpc there in front of jsonRPCEndpoint
- [genesis.json before changes] => "jsonRPCEndpoint": "https://polygon-rpc.com"
- [genesis.json after changes] => "jsonRPCEndpoint": "your-rpc-here"

#### Set RPC & PK in .env files
#### There are 2 .env files present on the path as below. You need to do these changes for both the .env files
- ./.env
- ./scripts/.env
### 2 - Open the ./.env file and set RPC to your polygon mainnet RPC. Do the same for ./scripts/.env
- `Primary wallet : 5 Matic AND (250k + 10) CHAIN`
### 3 - Open the ./.env file and set PK same as your primary wallet's Private Key. Do the same for ./scripts/.env

### Once Done, double check everything

### If everything seems correct, run the command below, and that should setup the validator correctly for you (given the prerequisites are met)

<br>
<hr>
<br>

# 1 - Setup Validator 
```
sudo ./scripts/addValidator
```

# 2 - Start Validator Node using any one : [ Binary | Docker ]

## 2.1 - Run Validator Node using local binary (Preffered*)
```
sudo screen ./scripts/start

# Close the terminal and run the command below in new terminal session to check if the process is running or not.
ps ax | grep polygon

# The above command should list the validator node process running. Something like this.
[
    ./polygon-edge server --data-dir ./test-chain-5 --chain ./genesis.json --grpc-address :10000 --libp2p 0.0.0.0:30301 --jsonrpc :10002 --relayer --num-block-confirmations 2 --seal --log-level INFO
]

# If you get screen is terminating issue, run the command without screen 

sudo ./scripts/start
```

## 2.2 - Run Validator Node using Docker
## Install Docker
```
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update

# Install docker tools
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Check Docker Installation
sudo docker run hello-world
```

## Run Validator Node (Docker)
```
# Run the command below to build the validator docker image. Along with dot (.) at end
sudo docker build -t validator5 .

# Start the docker container from built image.
sudo docker run -d --name validator5 -it -p 10000:10000 -p 30301:30301 -p 10002:10002 validator5:latest /bin/fish

# Now the docker container should be running. We need to enter the running docker container.
sudo docker exec -it validator5 /bin/fish

# To start the validator node.
sudo screen ./scripts/start

# Close the terminal.
```
<br>
<hr>
<br>

# :) Docker helper commands

## To Enter into running docker container
```
sudo docker exec -it validator5 /bin/fish
```

## Check the validator node process running
```
ps ax | grep polygon

# The above command should list the validator node process running. Something like this.
[
    ./polygon-edge server --data-dir ./test-chain-5 --chain ./genesis.json --grpc-address :10000 --libp2p 0.0.0.0:30301 --jsonrpc :10002 --relayer --num-block-confirmations 2 --seal --log-level INFO
]

```

## To stop the running validator node process

```
sudo killall polygon-edge
```

<br>
<hr>
<br>

# :) Supernet Node Validator helpers

## To get the private key of your node validator
```
sudo cat ./test-chain-5/consensus/validator.key 
```

## To set name & image for your node validator
```
# Run without angular brackets <> by replacing your respective info.
node setValidatorInfo.js <validator-private-key> <validator-name-here> " " <full-path-to-image.png>

# for example (name = CG-Validator, image = /root/chaingames.png);
node setValidatorInfo.js validatorPrivateKey CG-Validator " " /root/chaingames.png
```

## To set commission for your node validator
```
node updateCommissionRate.js <pk> <amount-in-percentage>

# for example (set 2% commission);
node updateCommissionRate.js validatorPrivateKey 2
```