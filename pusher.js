const CLI = require('cli-flags')
const {flags, args} = CLI.parse({
  flags: {
    'address': CLI.flags.string({char: 'a'}),
    'password': CLI.flags.string({char: 'x'}),
    'provider': CLI.flags.string({char: 'p'})
  },
  args: [
    {name: 'contract', required: true}
  ]
})

const address = flags.address
const password = flags.password
const provider = flags.provider
const contractPath = args.contract

console.log(address, password, provider, contractPath)


const Web3 = require('web3')
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider(provider));
}


if (provider == "") {
    console.log("no provider is provided")
    process.exit()
}

var fs = require('fs');
if (!fs.existsSync(contractPath)) {
    console.log("contract path incorrect: " + contractPath)
    process.exit()
}

fs.readFile(contractPath, {encoding: 'utf-8'}, function(err,data){
    if (!err) {
      runDeployment(data)
    } else {
      console.log(err);
      process.exit()
    }
})

function runDeployment(data){
  eval(data)
  web3.eth.personal.getAccounts()
  .then(data => {
    console.log("using account " + address)
    return web3.eth.personal.unlockAccount(address, password)
  })
  .then(() => {
    console.log("unlocked account. estimating gas...");
    var storageContractAbi = storageOutput.contracts['contract.sol:Storage'].abi
    var contract = new web3.eth.Contract(JSON.parse(storageContractAbi))
    var compiled = "0x" + storageOutput.contracts['contract.sol:Storage'].bin
    deploy = contract.deploy({
      data: compiled,
      arguments: [123]
    });
    return deploy.estimateGas({from: address})
  })
  .then(gasEstimate => {
    console.log("gasEstimate = " + gasEstimate + ", now deploying...");
    return deploy.send({
      from: address,
      gas: gasEstimate,
      gasLimit: 4000000
    })
    .once('transactionHash', hash => {
      console.log("transaction hash: " + hash);
      web3.eth.getTransaction(hash)
      .then(transaction => console.log("gasPrice was: " + transaction.gasPrice));
    })
  })
  .then(() => console.log("done"))
  .catch(err => console.log(err.stack))
}
