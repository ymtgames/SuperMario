import {OntologyContract, parseBigInt} from "./base";
import {Crypto, Parameter, ParameterType} from "ontology-ts-sdk";
import {tokenHash} from "./config";

class TokenContract extends OntologyContract {

    constructor() {
        super(tokenHash)
    }

    async totalSupply() {
        console.log(`Contract Hash: ${this.contractHash}, check totalSupply`)
        const res = await this.query('totalSupply')
        if (res) {
            return parseBigInt(res)
        }
    }

    async decimals() {
        console.log(`Contract Hash: ${this.contractHash}, check decimals`)
        const res = await this.query('decimals')
        if (res) {
            return parseBigInt(res)
        }
    }

    async name() {
        console.log(`Contract Hash: ${this.contractHash}, check name`)
        const res = await this.query('name')
        if (res) {
            return this.utils.hexstr2str(res)
        }
    }

    async balanceOf(account) {
        account = account || await this.account()
        console.log(`Contract Hash: ${this.contractHash}, check balanceOf ${account}`)
        const address = new Crypto.Address(account);
        const res = await this.query('balanceOf', [
            new Parameter('account', ParameterType.ByteArray, address.serialize())
        ])
        if (res) {
            return parseBigInt(res)
        }
    }

    async transfer(from, to, amount) {
        const res = await this.exec('transfer', [
            new Parameter('from', ParameterType.ByteArray, new Crypto.Address(from).serialize()),
            new Parameter('to', ParameterType.ByteArray, new Crypto.Address(to).serialize()),
            new Parameter('amount', ParameterType.Integer, parseInt(amount))
        ])
        return res
    }
}


window.ontSdk = window.ontSdk || {};
export const token = window.ontSdk.token = new TokenContract();
