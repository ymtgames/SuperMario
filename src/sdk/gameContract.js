import {OntologyContract, parseBigInt} from "./base";
import {Crypto, Parameter, ParameterType} from "ontology-ts-sdk";
import {gameHash, tokenHash} from "./config";

class GameContract extends OntologyContract {

    constructor() {
        super(gameHash)
    }

    async setOEP4ContractHash() {
        const reverseHash = this.utils.reverseHex(tokenHash);
        console.log(`Token Hash: ${tokenHash}\nReverse Hash: ${reverseHash}`);
        const res = await this.exec('setOEP4ContractHash', [
            new Parameter('account', ParameterType.ByteArray, reverseHash),
        ]);
        return res
    }

    async getTokenName() {
        console.log(`Contract Hash: ${this.contractHash}, check getTokenName`);
        const res = await this.query('getTokenName')
        if (res) {
            return this.utils.hexstr2str(res)
        }
    }

    async getName() {
        console.log(`Contract Hash: ${this.contractHash}, check getName`)
        const res = await this.query('getName')
        if (res) {
            return this.utils.hexstr2str(res)
        }
    }

    async canCheckIn(account) {
        account = account || await this.account();
        console.log(`Contract Hash: ${this.contractHash}, check canCheckIn`, account)
        const address = new Crypto.Address(account);
        const byteArray = address.serialize();
        const queryChecked = await this.query('canCheckIn', [
            new Parameter('account', ParameterType.ByteArray, byteArray)
        ]);
        console.log('queryChecked', queryChecked)
        if (queryChecked === undefined || queryChecked === null) {
            throw "Query Contract Error"
        }
        return parseBigInt(queryChecked);
    }

    async login(account) {
        account = account || await this.account();
        const address = new Crypto.Address(account);
        const byteArray = address.serialize();
        const alreadyChecked = await this.canCheckIn(account);
        console.log('alreadyChecked', alreadyChecked);
        if ('0' === alreadyChecked) {
            console.log(`already checked(${byteArray}) account: ${account} alreadyChecked: ${alreadyChecked}`);
            return true;
        } else {
            console.log(`checkIn(${byteArray}) account: ${account} alreadyChecked: ${alreadyChecked}`);
            const res = await this.exec('checkIn', [
                new Parameter('account', ParameterType.ByteArray, byteArray),
            ]);
            return res
        }
    }
}

export const game = new GameContract();
window.ontSdk = window.ontSdk || {};
window.ontSdk.game = game;
