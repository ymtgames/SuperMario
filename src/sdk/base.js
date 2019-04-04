import {client} from 'ontology-dapi'
import {RestClient, Crypto, utils} from 'ontology-ts-sdk'
import {BigNumber} from 'bignumber.js'
import {gasPrice, gasLimit} from "./config";

export const parseBigInt = (val) => {
    return new BigNumber(utils.reverseHex(val), 16).toString();
}

client.registerClient({})

export class OntologyContract {

    constructor(contractHash) {
        this.contractHash = contractHash;
        const address = new Crypto.Address(utils.reverseHex(this.contractHash));
        this.contractAddr = address;
        this.utils = utils
    }

    // async init(network = 1){
    //     if(network === 1) {
    //         this.url = 'http://polaris1.ont.io:20334'
    //     } else if(network === 2) {
    //         this.url = 'http://dappnode1.ont.io:20334'
    //     } else {
    //         this.url = network+ ':20334'
    //     }
    //     const restClient = new RestClient(this.url);// Default connect to Testnet
    //     try {
    //         await restClient.getContract(this.contractHash);
    //     } catch(err) {
    //         this.$message.error('Network error')
    //     }
    //     return this
    // }

    // async get
    async query(method, params = []) {
        if (!this.contractAddr) {
            alert('The contract has not been deployed yet.')
            return;
        }
        try {
            let result;
            result = await
                client.api.smartContract.invokeRead({
                    contract: this.contractHash,
                    method: method,
                    parameters: params
                });
            console.log('onScCall finished, result:' + JSON.stringify(result));
            return result;
        } catch (e) {
            console.log('onScCall error:', e);
            alert('Some error happens. Please try later.')
            return null;
        }
    }

    async exec(method, params) {
        if (!this.contractAddr) {
            alert('The contract has not been deployed yet.')
            return;
        }
        let result;
        result = await client.api.smartContract.invoke({
            contract: this.contractHash,
            method: method,
            parameters: params,
            gasPrice,
            gasLimit
        });

        console.log('onScCall finished, result:' + JSON.stringify(result));
        if(result.Error === -1) {
            throw result;
        }
        return result;
    }

    async provider() {
        return await client.api.provider.getProvider();
    }

    async account() {
        return await client.api.asset.getAccount();
    }

    async identity() {
        return await client.api.identity.getIdentity();
    }


    // async call(scriptHash, operation, args, gasPrice, gasLimit, payer, config) { // for latest ontology-dapi
    //     const ret = await client.api.smartContract.invoke({
    //         scriptHash,
    //         operation,
    //         args,
    //         gasPrice,
    //         gasLimit,
    //         payer,
    //         config
    //     });
    //     return ret
    // }
}

window.ontSdk = window.ontSdk || {};
window.ontSdk.contact = hash => new OntologyContract(hash);
window.ontSdk.invoke = async (contractHash, method, parameters) => {
    await client.api.smartContract.invoke({
        contract: contractHash,
        method,
        parameters,
        gasPrice,
        gasLimit
    })
}
// window.ontSdk.login = async (contractHash, method, parameters) => { // this api is not exist
//     const params ={
//         type: 'account',
//         dappName: 'My dapp',
//         dappIcon: 'http://mydapp.com/icon.png',
//         message: 'test message',
//         expired: new Date('2019-12-12').getTime(),
//         callback: ''
//     }
//     let res;
//     try {
//         res = await client.api.message.login(params);
//         console.log(res)
//     }catch(err) {
//         console.log(err)
//     }
// }
//
// window.ontSdk.getTransactions = async (acc, network = 1, pagenumber = 0, pagesize = 30) => { // cor issue
//     let url = ''
//     if (network === 1) {
//         url = 'http://polarisexplorer.ont.io'
//     } else if (network === 2) {
//         url = 'http://explorer.ont.io'
//     } else {
//         url = network + ':20334'
//     }
//     console.log(JSON.parse(await fetch(`${url}/api/v1/explorer/address/${acc}/${pagesize}/${pagenumber}`)));
// }
