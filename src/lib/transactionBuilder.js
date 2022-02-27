import LitetokensWeb from 'index';
import utils from 'utils';
import * as Ethers from 'ethers';

export default class TransactionBuilder {
    constructor(litetokensWeb = false) {
        if(!litetokensWeb || !litetokensWeb instanceof LitetokensWeb)
            throw new Error('Expected instance of LitetokensWeb');

        this.litetokensWeb = litetokensWeb;
        this.injectPromise = utils.promiseInjector(this);
    }

    sendXlt(to = false, amount = 0, from = this.litetokensWeb.defaultAddress.hex, callback = false) {
        if(utils.isFunction(from)) {
            callback = from;
            from = this.litetokensWeb.defaultAddress.hex;
        }

        if(!callback)
            return this.injectPromise(this.sendXlt, to, amount, from);

        if(!this.litetokensWeb.isAddress(to))
            return callback('Invalid recipient address provided');

        if(!utils.isInteger(amount) || amount <= 0)
            return callback('Invalid amount provided');

        if(!this.litetokensWeb.isAddress(from))
            return callback('Invalid origin address provided');

        to = this.litetokensWeb.address.toHex(to);
        from = this.litetokensWeb.address.toHex(from);

        if(to === from)
            return callback('Cannot transfer XLT to the same account');

        this.litetokensWeb.fullNode.request('wallet/createtransaction', {
            to_address: to,
            owner_address: from,
            amount: parseInt(amount)
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    sendToken(to = false, amount = 0, tokenID = false, from = this.litetokensWeb.defaultAddress.hex, callback = false) {
        if(utils.isFunction(from)) {
            callback = from;
            from = this.litetokensWeb.defaultAddress.hex;
        }

        if(!callback)
            return this.injectPromise(this.sendToken, to, amount, tokenID, from);

        if(!this.litetokensWeb.isAddress(to))
            return callback('Invalid recipient address provided');

        if(!utils.isInteger(amount) || amount <= 0)
            return callback('Invalid amount provided');

        if(!utils.isString(tokenID) || !tokenID.length)
            return callback('Invalid token ID provided');

        if(!this.litetokensWeb.isAddress(from))
            return callback('Invalid origin address provided');

        to = this.litetokensWeb.address.toHex(to);
        tokenID = this.litetokensWeb.fromUtf8(tokenID);
        from = this.litetokensWeb.address.toHex(from);

        if(to === from)
            return callback('Cannot transfer tokens to the same account');

        this.litetokensWeb.fullNode.request('wallet/transferasset', {
            to_address: to,
            owner_address: from,
            asset_name: tokenID,
            amount: parseInt(amount)
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    purchaseToken(issuerAddress = false, tokenID = false, amount = 0, buyer = this.litetokensWeb.defaultAddress.hex, callback = false) {
        if(utils.isFunction(buyer)) {
            callback = buyer;
            buyer = this.litetokensWeb.defaultAddress.hex;
        }

        if(!callback)
            return this.injectPromise(this.purchaseToken, issuerAddress, tokenID, amount, buyer);

        if(!this.litetokensWeb.isAddress(issuerAddress))
            return callback('Invalid issuer address provided');

        if(!utils.isString(tokenID) || !tokenID.length)
            return callback('Invalid token ID provided');

        if(!utils.isInteger(amount) || amount <= 0)
            return callback('Invalid amount provided');

        if(!this.litetokensWeb.isAddress(buyer))
            return callback('Invalid buyer address provided');

        this.litetokensWeb.fullNode.request('wallet/participateassetissue', {
            to_address: this.litetokensWeb.address.toHex(issuerAddress),
            owner_address: this.litetokensWeb.address.toHex(buyer),
            asset_name: this.litetokensWeb.fromUtf8(tokenID),
            amount: parseInt(amount)
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    freezeBalance(amount = 0, duration = 3, resource = "BANDWIDTH", address = this.litetokensWeb.defaultAddress.hex, callback = false)
    {
        if(utils.isFunction(address)) {
            callback = address;
            address = this.litetokensWeb.defaultAddress.hex;
        }

        if(utils.isFunction(duration)) {
            callback = duration;
            duration = 3;
        }

        if(utils.isFunction(resource)) {
            callback = resource;
            resource = "BANDWIDTH";
        }

        if(!callback)
            return this.injectPromise(this.freezeBalance, amount, duration, resource, address);

        if(![ 'BANDWIDTH', 'ENERGY' ].includes(resource))
            return callback('Invalid resource provided: Expected "BANDWIDTH" or "ENERGY"');

        if(!utils.isInteger(amount) || amount <= 0)
            return callback('Invalid amount provided');

        if(!utils.isInteger(duration) || duration < 3)
            return callback('Invalid duration provided, minimum of 3 days');

        if(!this.litetokensWeb.isAddress(address))
            return callback('Invalid address provided');

        this.litetokensWeb.fullNode.request('wallet/freezebalance', {
            owner_address: this.litetokensWeb.address.toHex(address),
            frozen_balance: parseInt(amount),
            frozen_duration: parseInt(duration),
            resource: resource
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    unfreezeBalance(resource = "BANDWIDTH", address = this.litetokensWeb.defaultAddress.hex, callback = false)
    {
        if(utils.isFunction(address)) {
            callback = address;
            address = this.litetokensWeb.defaultAddress.hex;
        }

        if(utils.isFunction(resource)) {
            callback = resource;
            resource = "BANDWIDTH";
        }

        if(!callback)
            return this.injectPromise(this.unfreezeBalance, resource, address);

        if(![ 'BANDWIDTH', 'ENERGY' ].includes(resource))
            return callback('Invalid resource provided: Expected "BANDWIDTH" or "ENERGY"');

        if(!this.litetokensWeb.isAddress(address))
            return callback('Invalid address provided');

        this.litetokensWeb.fullNode.request('wallet/unfreezebalance', {
            owner_address: this.litetokensWeb.address.toHex(address),
            resource: resource
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    withdrawBlockRewards(address = this.litetokensWeb.defaultAddress.hex, callback = false) {
        if(utils.isFunction(address)) {
            callback = address;
            address = this.litetokensWeb.defaultAddress.hex;
        }

        if(!callback)
            return this.injectPromise(this.withdrawBlockRewards, address);

        if(!this.litetokensWeb.isAddress(address))
            return callback('Invalid address provided');

        this.litetokensWeb.fullNode.request('wallet/withdrawbalance', {
            owner_address: this.litetokensWeb.address.toHex(address)
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    applyForSR(address = this.litetokensWeb.defaultAddress.hex, url = false, callback = false) {
        if(utils.isValidURL(address)) {
            callback = url || false;
            url = address;
            address = this.litetokensWeb.defaultAddress.hex;
        }

        if(!callback)
            return this.injectPromise(this.applyForSR, address, url);

        if(!this.litetokensWeb.isAddress(address))
            return callback('Invalid address provided');

        if(!utils.isValidURL(url))
            return callback('Invalid url provided');

        this.litetokensWeb.fullNode.request('wallet/createwitness', {
            owner_address: this.litetokensWeb.address.toHex(address),
            url: this.litetokensWeb.fromUtf8(url)
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    vote(votes = {}, voterAddress = this.litetokensWeb.defaultAddress.hex, callback = false) {
        if(utils.isFunction(voterAddress)) {
            callback = voterAddress;
            voterAddress = this.litetokensWeb.defaultAddress.hex;
        }

        if(!callback)
            return this.injectPromise(this.vote, votes, voterAddress);

        if(!utils.isObject(votes) || !Object.keys(votes).length)
            return callback('Invalid votes object provided');

        if(!this.litetokensWeb.isAddress(voterAddress))
            return callback('Invalid voter address provided');

        let invalid = false;

        votes = Object.entries(votes).map(([ srAddress, voteCount ]) => {
            if(invalid)
                return;

            if(!this.litetokensWeb.isAddress(srAddress)) {
                callback('Invalid SR address provided: ' + srAddress);
                return invalid = true;
            }

            if(!utils.isInteger(voteCount) || voteCount <= 0) {
                callback('Invalid vote count provided for SR: ' + srAddress);
                return invalid = true;
            }

            return {
                vote_address: this.litetokensWeb.address.toHex(srAddress),
                vote_count: parseInt(voteCount)
            };
        });

        if(invalid)
            return;

        this.litetokensWeb.fullNode.request('wallet/votewitnessaccount', {
            owner_address: this.litetokensWeb.address.toHex(voterAddress),
            votes
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    createSmartContract(options = {}, issuerAddress = this.litetokensWeb.defaultAddress.hex, callback = false) {
        if(utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.litetokensWeb.defaultAddress.hex;
        }

        if(!callback)
            return this.injectPromise(this.createSmartContract, options, issuerAddress);

        let {
            abi = false,
            bytecode = false,
            feeLimit = 1_000_000_000,
            callValue = 0,
            userFeePercentage = 0,
            originEnergyLimit = 10_000_000,
            parameters = [],
            name = "",
        } = options;


        if(abi && utils.isString(abi)) {
            try {
                abi = JSON.parse(abi);
            } catch{
                return callback('Invalid options.abi provided');
            }
        }

        if(!utils.isArray(abi))
            return callback('Invalid options.abi provided');


        const payable = abi.some(func => {
            return func.type == 'constructor' && func.payable;
        });

        if(!utils.isHex(bytecode))
            return callback('Invalid options.bytecode provided');

        if(!utils.isInteger(feeLimit) || feeLimit <= 0 || feeLimit > 1_000_000_000)
            return callback('Invalid options.feeLimit provided');

        if(!utils.isInteger(callValue) || callValue < 0)
            return callback('Invalid options.callValue provided');

        if(payable && callValue == 0)
            return callback('When contract is payable, options.callValue must be a positive integer');

        if(!payable && callValue > 0)
            return callback('When contract is not payable, options.callValue must be 0');

        if(!utils.isInteger(userFeePercentage) || userFeePercentage < 0 || userFeePercentage > 100)
            return callback('Invalid options.userFeePercentage provided');

        if(!utils.isInteger(originEnergyLimit) || originEnergyLimit < 0)
            return callback('Invalid options.originEnergyLimit provided');
        if(!utils.isArray(parameters))
            return callback('Invalid parameters provided');

        if(!this.litetokensWeb.isAddress(issuerAddress))
            return callback('Invalid issuer address provided');

        var constructorParams = abi.find(
            (it) => {
                return it.type === 'constructor';
            }
        );

        if(typeof constructorParams !== 'undefined' && constructorParams) {
            const abiCoder = new Ethers.utils.AbiCoder();
            const types = [];
            const values = [];
            constructorParams = constructorParams.inputs;

            if(parameters.length != constructorParams.length)
                return callback(`constructor needs ${constructorParams.length} but ${parameters.length} provided`);

            for(let i = 0; i < parameters.length; i++) {
                let type = constructorParams[i].type;
                let value = parameters[i];

                if(!type || !utils.isString(type) || !type.length)
                    return callback('Invalid parameter type provided: ' + type);

                if(type == 'address')
                    value = this.litetokensWeb.address.toHex(value).replace(/^(41)/, '0x');

                types.push(type);
                values.push(value);
            }

            try {
                parameters = abiCoder.encode(types, values).replace(/^(0x)/, '');
            } catch (ex) {
                return callback(ex);
            }
        } else parameters = '';

        this.litetokensWeb.fullNode.request('wallet/deploycontract', {
            owner_address: this.litetokensWeb.address.toHex(issuerAddress),
            fee_limit: parseInt(feeLimit),
            call_value: parseInt(callValue),
            consume_user_resource_percent: userFeePercentage,
            origin_energy_limit: originEnergyLimit,
            abi: JSON.stringify(abi),
            bytecode,
            parameter: parameters,
            name
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    triggerSmartContract(
        contractAddress,
        functionSelector,
        feeLimit = 1_000_000_000,
        callValue = 0,
        parameters = [],
        issuerAddress = this.litetokensWeb.defaultAddress.hex,
        callback = false
    ) {
        if(utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.litetokensWeb.defaultAddress.hex;
        }

        if(utils.isFunction(parameters)) {
            callback = parameters;
            parameters = [];
        }

        if(utils.isFunction(callValue)) {
            callback = callValue;
            callValue = 0;
        }

        if(utils.isFunction(feeLimit)) {
            callback = feeLimit;
            feeLimit = 1_000_000_000;
        }

        if(!callback) {
            return this.injectPromise(
                this.triggerSmartContract,
                contractAddress,
                functionSelector,
                feeLimit,
                callValue,
                parameters,
                issuerAddress
            );
        }

        if(!this.litetokensWeb.isAddress(contractAddress))
            return callback('Invalid contract address provided');

        if(!utils.isString(functionSelector) || !functionSelector.length)
            return callback('Invalid function selector provided');

        if(!utils.isInteger(callValue) || callValue < 0)
            return callback('Invalid call value provided');

        if(!utils.isInteger(feeLimit) || feeLimit <= 0 || feeLimit > 1_000_000_000)
            return callback('Invalid fee limit provided');

        if(!utils.isArray(parameters))
            return callback('Invalid parameters provided');

        if(!this.litetokensWeb.isAddress(issuerAddress))
            return callback('Invalid issuer address provided');

        functionSelector = functionSelector.replace('/\s*/g', '');

        if(parameters.length) {
            const abiCoder = new Ethers.utils.AbiCoder();
            const types = [];
            const values = [];

            for(let i = 0; i < parameters.length; i++) {
                let { type, value } = parameters[i];

                if(!type || !utils.isString(type) || !type.length)
                    return callback('Invalid parameter type provided: ' + type);

                if(type == 'address')
                    value = this.litetokensWeb.address.toHex(value).replace(/^(41)/, '0x');

                types.push(type);
                values.push(value);
            }

            try {
                parameters = abiCoder.encode(types, values).replace(/^(0x)/, '');
            } catch (ex) {
                return callback(ex);
            }
        } else parameters = '';

        this.litetokensWeb.fullNode.request('wallet/triggersmartcontract', {
            contract_address: this.litetokensWeb.address.toHex(contractAddress),
            owner_address: this.litetokensWeb.address.toHex(issuerAddress),
            function_selector: functionSelector,
            fee_limit: parseInt(feeLimit),
            call_value: parseInt(callValue),
            parameter: parameters
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            if(transaction.result && transaction.result.message) {
                return callback(
                    this.litetokensWeb.toUtf8(transaction.result.message)
                );
            }

            if(!transaction.result.result)
                return callback(transaction);

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    createToken(options = {}, issuerAddress = this.litetokensWeb.defaultAddress.hex, callback = false) {
        if(utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.litetokensWeb.defaultAddress.hex;
        }

        if(!callback)
            return this.injectPromise(this.createToken, options, issuerAddress);

        const {
            name = false,
            abbreviation = false,
            description = false,
            url = false,
            totalSupply = 0,
            xltRatio = 1, // How much XLT will `tokenRatio` cost?
            tokenRatio = 1, // How many tokens will `xltRatio` afford?
            saleStart = Date.now(),
            saleEnd = false,
            freeBandwidth = 0, // The creator's "donated" bandwidth for use by token holders
            freeBandwidthLimit = 0, // Out of `totalFreeBandwidth`, the amount each token holder get
            frozenAmount = 0,
            frozenDuration = 0
        } = options;

        if(!utils.isString(name) || !name.length)
            return callback('Invalid token name provided');

        if(!utils.isString(abbreviation) || !abbreviation.length)
            return callback('Invalid token abbreviation provided');

        if(!utils.isInteger(totalSupply) || totalSupply <= 0)
            return callback('Invalid supply amount provided');

        if(!utils.isInteger(xltRatio) || xltRatio <= 0)
            return callback('XLT ratio must be a positive integer');

        if(!utils.isInteger(tokenRatio) || tokenRatio <= 0)
            return callback('Token ratio must be a positive integer');

        if(!utils.isInteger(saleStart) || saleStart < Date.now())
            return callback('Invalid sale start timestamp provided');

        if(!utils.isInteger(saleEnd) || saleEnd <= saleStart)
            return callback('Invalid sale end timestamp provided');

        if(!utils.isString(description) || !description.length)
            return callback('Invalid token description provided');

        if(!utils.isString(url) || !url.length || !utils.isValidURL(url))
            return callback('Invalid token url provided');

        if(!utils.isInteger(freeBandwidth) || freeBandwidth < 0)
            return callback('Invalid free bandwidth amount provided');

        if(!utils.isInteger(freeBandwidthLimit) || freeBandwidthLimit < 0 || (freeBandwidth && !freeBandwidthLimit))
            return callback('Invalid free bandwidth limit provided');

        if(!utils.isInteger(frozenAmount) || frozenAmount < 0 || (!frozenDuration && frozenAmount))
            return callback('Invalid frozen supply provided');

        if(!utils.isInteger(frozenDuration) || frozenDuration < 0 || (frozenDuration && !frozenAmount))
            return callback('Invalid frozen duration provided');

        if(!this.litetokensWeb.isAddress(issuerAddress))
            return callback('Invalid issuer address provided');

        this.litetokensWeb.fullNode.request('wallet/createassetissue', {
            owner_address: this.litetokensWeb.address.toHex(issuerAddress),
            name: this.litetokensWeb.fromUtf8(name),
            abbr: this.litetokensWeb.fromUtf8(abbreviation),
            description: this.litetokensWeb.fromUtf8(description),
            url: this.litetokensWeb.fromUtf8(url),
            total_supply: parseInt(totalSupply),
            xlt_num: parseInt(xltRatio),
            num: parseInt(tokenRatio),
            start_time: parseInt(saleStart),
            end_time: parseInt(saleEnd),
            free_asset_net_limit: parseInt(freeBandwidth),
            public_free_asset_net_limit: parseInt(freeBandwidthLimit),
            frozen_supply: {
                frozen_amount: parseInt(frozenAmount),
                frozen_days: parseInt(frozenDuration)
            }
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            if(transaction.result && transaction.result.message) {
                return callback(
                    this.litetokensWeb.toUtf8(transaction.result.message)
                );
            }

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    updateAccount(accountName = false, address = this.litetokensWeb.defaultAddress.hex, callback = false)
    {
        if(utils.isFunction(address)) {
            callback = address;
            address = this.litetokensWeb.defaultAddress.hex;
        }

        if(!callback) {
            return this.injectPromise(this.updateAccount, accountName, address);
        }

        if (!utils.isString(accountName) || !accountName.length) {
            return callback('Name must be a string');
        }

        if(!this.litetokensWeb.isAddress(address)) {
            return callback('Invalid origin address provided');
        }

        this.litetokensWeb.fullNode.request('wallet/updateaccount', {
            account_name: this.litetokensWeb.fromUtf8(accountName),
            owner_address: this.litetokensWeb.address.toHex(address),
        }, 'post').then(transaction => {

            if(transaction.Error)
                return callback(transaction.Error);

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    updateToken(options = {}, issuerAddress = this.litetokensWeb.defaultAddress.hex, callback = false) {
        if(utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.litetokensWeb.defaultAddress.hex;
        }

        if(!callback)
            return this.injectPromise(this.updateToken, options, issuerAddress);

        const {
            description = false,
            url = false,
            freeBandwidth = 0, // The creator's "donated" bandwidth for use by token holders
            freeBandwidthLimit = 0 // Out of `totalFreeBandwidth`, the amount each token holder get
        } = options;

        if(!utils.isInteger(freeBandwidth) || freeBandwidth < 0)
            return callback('Invalid free bandwidth amount provided');

        if(!utils.isInteger(freeBandwidthLimit) || freeBandwidthLimit < 0 || (freeBandwidth && !freeBandwidthLimit))
            return callback('Invalid free bandwidth limit provided');

        if(!this.litetokensWeb.isAddress(issuerAddress))
            return callback('Invalid issuer address provided');

        this.litetokensWeb.fullNode.request('wallet/updateasset', {
            owner_address: this.litetokensWeb.address.toHex(issuerAddress),
            description: this.litetokensWeb.fromUtf8(description),
            url: this.litetokensWeb.fromUtf8(url),
            new_limit: parseInt(freeBandwidth),
            new_public_limit: parseInt(freeBandwidthLimit)
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            if(transaction.result && transaction.result.message) {
                return callback(
                    this.litetokensWeb.toUtf8(transaction.result.message)
                );
            }

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    sendAsset(...args) {
        return this.sendToken(...args);
    }

    purchaseAsset(...args) {
        return this.purchaseToken(...args);
    }

    createAsset(...args) {
        return this.createToken(...args);
    }

    updateAsset(...args) {
        return this.updateToken(...args);
    }

    /**
     * Creates a proposal to modify the network.
     * Can only be created by a current Super Representative.
     */
    createProposal(parameters = false, issuerAddress = this.litetokensWeb.defaultAddress.hex, callback = false) {
        if(utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.litetokensWeb.defaultAddress.hex;
        }

        if(!parameters)
            return callback('Invalid proposal parameters provided');

        if(!callback)
            return this.injectPromise(this.createProposal, parameters, issuerAddress);

        if(!this.litetokensWeb.isAddress(issuerAddress))
            return callback('Invalid issuerAddress provided');

        if (!utils.isArray(parameters)) {
            parameters = [parameters];
        }

        for (let parameter of parameters) {
            if(!utils.isObject(parameter))
                return callback('Invalid parameters provided');
        }

        this.litetokensWeb.fullNode.request('wallet/proposalcreate', {
            owner_address: this.litetokensWeb.address.toHex(issuerAddress),
            parameters: parameters
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            if(transaction.result && transaction.result.message) {
                return callback(
                    this.litetokensWeb.toUtf8(transaction.result.message)
                );
            }

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    /**
     * Deletes a network modification proposal that the owner issued.
     * Only current Super Representative can vote on a proposal.
     */
    deleteProposal(proposalID = false, issuerAddress = this.litetokensWeb.defaultAddress.hex, callback = false) {
        if(utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.litetokensWeb.defaultAddress.hex;
        }

        if(!callback)
            return this.injectPromise(this.deleteProposal, proposalID, issuerAddress);

        if(!this.litetokensWeb.isAddress(issuerAddress))
            return callback('Invalid issuerAddress provided');

        if(!utils.isInteger(proposalID) || proposalID < 0)
            return callback('Invalid proposalID provided');

        this.litetokensWeb.fullNode.request('wallet/proposaldelete', {
            owner_address: this.litetokensWeb.address.toHex(issuerAddress),
            proposal_id: parseInt(proposalID)
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            if(transaction.result && transaction.result.message) {
                return callback(
                    this.litetokensWeb.toUtf8(transaction.result.message)
                );
            }

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    /**
     * Adds a vote to an issued network modification proposal.
     * Only current Super Representative can vote on a proposal.
     */
    voteProposal(proposalID = false, isApproval = false, voterAddress = this.litetokensWeb.defaultAddress.hex, callback = false) {
        if(utils.isFunction(voterAddress)) {
            callback = voterAddress;
            voterAddress = this.litetokensWeb.defaultAddress.hex;
        }

        if(!callback)
            return this.injectPromise(this.voteProposal, proposalID, isApproval, voterAddress);

        if(!this.litetokensWeb.isAddress(voterAddress))
            return callback('Invalid voterAddress address provided');

        if(!utils.isInteger(proposalID) || proposalID < 0)
            return callback('Invalid proposalID provided');

        if(!utils.isBoolean(isApproval))
            return callback('Invalid hasApproval provided');

        this.litetokensWeb.fullNode.request('wallet/proposalapprove', {
            owner_address: this.litetokensWeb.address.toHex(voterAddress),
            proposal_id: parseInt(proposalID),
            is_add_approval: isApproval
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            if(transaction.result && transaction.result.message) {
                return callback(
                    this.litetokensWeb.toUtf8(transaction.result.message)
                );
            }

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    /**
     * Create an exchange between a token and XLT.
     * Token Name should be a CASE SENSITIVE string.
     * PLEASE VERIFY THIS ON LITETOKENSSCAN.
     */
    createXLTExchange(tokenName, tokenBalance, xltBalance, ownerAddress = this.litetokensWeb.defaultAddress.hex, callback = false) {
        if(utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.litetokensWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.createXLTExchange, tokenName, tokenBalance, xltBalance, ownerAddress);

        if (!this.litetokensWeb.isAddress(ownerAddress))
            return callback('Invalid address provided');

        if (!utils.isString(tokenName) || !tokenName.length)
            return callback('Invalid tokenName provided');

        if (!utils.isInteger(tokenBalance) || tokenBalance <= 0
            || !utils.isInteger(xltBalance) || xltBalance <= 0)
            return callback('Invalid amount provided');

        this.litetokensWeb.fullNode.request('wallet/exchangecreate', {
            owner_address: this.litetokensWeb.address.toHex(ownerAddress),
            first_token_id: this.litetokensWeb.fromUtf8(tokenName),
            first_token_balance: tokenBalance,
            second_token_id: '5f', // Constant for XLT.
            second_token_balance: xltBalance
        }, 'post').then(resources => {
            callback(null, resources);
        }).catch(err => callback(err));
    }

    /**
     * Create an exchange between a token and another token.
     * DO NOT USE THIS FOR XLT.
     * Token Names should be a CASE SENSITIVE string.
     * PLEASE VERIFY THIS ON LITETOKENSSCAN.
     */
    createTokenExchange(firstTokenName, firstTokenBalance, secondTokenName, secondTokenBalance, ownerAddress = this.litetokensWeb.defaultAddress.hex, callback = false) {
        if(utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.litetokensWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.createXLTExchange, firstTokenName, firstTokenBalance, secondTokenName, secondTokenBalance, ownerAddress);

        if (!this.litetokensWeb.isAddress(ownerAddress))
            return callback('Invalid address provided');

        if (!utils.isString(firstTokenName) || !firstTokenName.length)
            return callback('Invalid firstTokenName provided');

        if (!utils.isString(secondTokenName) || !secondTokenName.length)
            return callback('Invalid secondTokenName provided');

        if (!utils.isInteger(firstTokenBalance) || firstTokenBalance <= 0
            || !utils.isInteger(secondTokenBalance) || secondTokenBalance <= 0)
            return callback('Invalid amount provided');

        this.litetokensWeb.fullNode.request('wallet/exchangecreate', {
            owner_address: this.litetokensWeb.address.toHex(ownerAddress),
            first_token_id: this.litetokensWeb.fromUtf8(firstTokenName),
            first_token_balance: firstTokenBalance,
            second_token_id: this.litetokensWeb.fromUtf8(secondTokenName),
            second_token_balance: secondTokenBalance
        }, 'post').then(resources => {
            callback(null, resources);
        }).catch(err => callback(err));
    }

    /**
     * Adds tokens into a bancor style exchange.
     * Will add both tokens at market rate.
     * Use "_" for the constant value for XLT.
     */
    injectExchangeTokens(exchangeID = false, tokenName = false, tokenAmount = 0, ownerAddress = this.litetokensWeb.defaultAddress.hex, callback = false) {
        if(utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.litetokensWeb.defaultAddress.hex;
        }

        if(!callback)
            return this.injectPromise(this.injectExchangeTokens, exchangeID, tokenName, tokenAmount, ownerAddress);

        if(!this.litetokensWeb.isAddress(ownerAddress))
            return callback('Invalid ownerAddress provided');

        if(!utils.isInteger(exchangeID) || exchangeID < 0)
            return callback('Invalid exchangeID provided');

        if(!utils.isString(tokenName) || !tokenName.length)
            return callback('Invalid tokenName provided');

        if(!utils.isInteger(tokenAmount) || tokenAmount < 1)
            return callback('Invalid tokenAmount provided');

        this.litetokensWeb.fullNode.request('wallet/exchangeinject', {
            owner_address: this.litetokensWeb.address.toHex(ownerAddress),
            exchange_id: parseInt(exchangeID),
            token_id: this.litetokensWeb.fromUtf8(tokenName),
            quant:parseInt(tokenAmount)
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            if(transaction.result && transaction.result.message) {
                return callback(
                    this.litetokensWeb.toUtf8(transaction.result.message)
                );
            }

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    /**
     * Withdraws tokens from a bancor style exchange.
     * Will withdraw at market rate both tokens.
     * Use "_" for the constant value for XLT.
     */
    withdrawExchangeTokens(exchangeID = false, tokenName = false, tokenAmount = 0, ownerAddress = this.litetokensWeb.defaultAddress.hex, callback = false) {
        if(utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.litetokensWeb.defaultAddress.hex;
        }

        if(!callback)
            return this.injectPromise(this.withdrawExchangeTokens, exchangeID, tokenName, tokenAmount, ownerAddress);

        if(!this.litetokensWeb.isAddress(ownerAddress))
            return callback('Invalid ownerAddress provided');

        if(!utils.isInteger(exchangeID) || exchangeID < 0)
            return callback('Invalid exchangeID provided');

        if(!utils.isString(tokenName) || !tokenName.length)
            return callback('Invalid tokenName provided');

        if(!utils.isInteger(tokenAmount) || tokenAmount < 1)
            return callback('Invalid tokenAmount provided');

        this.litetokensWeb.fullNode.request('wallet/exchangewithdraw', {
            owner_address: this.litetokensWeb.address.toHex(ownerAddress),
            exchange_id: parseInt(exchangeID),
            token_id: this.litetokensWeb.fromUtf8(tokenName),
            quant:parseInt(tokenAmount)
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            if(transaction.result && transaction.result.message) {
                return callback(
                    this.litetokensWeb.toUtf8(transaction.result.message)
                );
            }

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    /**
     * Trade tokens on a bancor style exchange.
     * Expected value is a validation and used to cap the total amt of token 2 spent.
     * Use "_" for the constant value for XLT.
     */
    tradeExchangeTokens(exchangeID = false,
        tokenName = false,
        tokenAmountSold = 0,
        tokenAmountExpected = 0,
        ownerAddress = this.litetokensWeb.defaultAddress.hex,
        callback = false) {
        if(utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.litetokensWeb.defaultAddress.hex;
        }

        if(!callback)
            return this.injectPromise(this.tradeExchangeTokens, exchangeID, tokenName, tokenAmountSold, tokenAmountExpected, ownerAddress);

        if(!this.litetokensWeb.isAddress(ownerAddress))
            return callback('Invalid ownerAddress provided');

        if(!utils.isInteger(exchangeID) || exchangeID < 0)
            return callback('Invalid exchangeID provided');

        if(!utils.isString(tokenName) || !tokenName.length)
            return callback('Invalid tokenName provided');

        if(!utils.isInteger(tokenAmountSold) || tokenAmountSold < 1)
            return callback('Invalid tokenAmountSold provided');

        if(!utils.isInteger(tokenAmountExpected) || tokenAmountExpected < 1)
            return callback('Invalid tokenAmountExpected provided');

        this.litetokensWeb.fullNode.request('wallet/exchangetransaction', {
            owner_address: this.litetokensWeb.address.toHex(ownerAddress),
            exchange_id: parseInt(exchangeID),
            token_id: this.litetokensWeb.fromAscii(tokenName),
            quant:parseInt(tokenAmountSold),
            expected:parseInt(tokenAmountExpected)
        }, 'post').then(transaction => {
            if(transaction.Error)
                return callback(transaction.Error);

            if(transaction.result && transaction.result.message) {
                return callback(
                    this.litetokensWeb.toUtf8(transaction.result.message)
                );
            }

            callback(null, transaction);
        }).catch(err => callback(err));
    }
}
