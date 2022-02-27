const chai = require('chai');
const LitetokensWeb = require('./setup/LitetokensWeb.js');

const assert = chai.assert;
const HttpProvider = LitetokensWeb.providers.HttpProvider;

const FULL_NODE_API = 'https://api.shasta.litescan.org';
const SOLIDITY_NODE_API = 'https://api.shasta.litescan.org';
const EVENT_API = 'https://api.shasta.litescan.org';
const PRIVATE_KEY = 'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0';
const ADDRESS_HEX = '30928c9af0651632157ef27a2cf17ca72c575a4d21';
const ADDRESS_BASE58 = 'LYaqMeF8c8eUHqjktYVQSAoJ933YthjNA1';

const createInstance = () => {
    return new LitetokensWeb(FULL_NODE_API, SOLIDITY_NODE_API, EVENT_API, PRIVATE_KEY);
}

describe('LitetokensWeb Instance', function () {

    describe('#constructor()', function () {
        it('should create a full instance', function () {
            const litetokensWeb = createInstance();
            assert.instanceOf(litetokensWeb, LitetokensWeb);
        });

        it('should create an instance without a private key', function () {
            const fullNode = new HttpProvider(FULL_NODE_API);
            const solidityNode = new HttpProvider(SOLIDITY_NODE_API);
            const eventServer = EVENT_API;

            const litetokensWeb = new LitetokensWeb(
                fullNode,
                solidityNode,
                eventServer
            );

            assert.equal(litetokensWeb.defaultPrivateKey, false);
        });

        it('should create an instance without an event server', function () {
            const fullNode = new HttpProvider(FULL_NODE_API);
            const solidityNode = new HttpProvider(SOLIDITY_NODE_API);

            const litetokensWeb = new LitetokensWeb(
                fullNode,
                solidityNode
            );

            assert.equal(litetokensWeb.eventServer, false);
        });

        it('should reject an invalid full node URL', function () {
            const solidityNode = new HttpProvider(SOLIDITY_NODE_API);

            assert.throws(() => new LitetokensWeb(
                '$' + FULL_NODE_API,
                solidityNode
            ), 'Invalid URL provided to HttpProvider');
        });

        it('should reject an invalid solidity node URL', function () {
            const fullNode = new HttpProvider(FULL_NODE_API);

            assert.throws(() => new LitetokensWeb(
                fullNode,
                '$' + SOLIDITY_NODE_API
            ), 'Invalid URL provided to HttpProvider');
        });

        it('should reject an invalid event server URL', function () {
            const fullNode = new HttpProvider(FULL_NODE_API);
            const solidityNode = new HttpProvider(SOLIDITY_NODE_API);

            assert.throws(() => new LitetokensWeb(
                fullNode,
                solidityNode,
                '$' + EVENT_API
            ), 'Invalid URL provided to HttpProvider');
        });
    });

    describe('#setDefaultBlock()', function () {
        it('should accept a positive integer', function () {
            const litetokensWeb = createInstance();

            litetokensWeb.setDefaultBlock(1);

            assert.equal(litetokensWeb.defaultBlock, 1);
        });

        it('should correct a negative integer', function () {
            const litetokensWeb = createInstance();

            litetokensWeb.setDefaultBlock(-2);

            assert.equal(litetokensWeb.defaultBlock, 2);
        });

        it('should accept 0', function () {
            const litetokensWeb = createInstance();

            litetokensWeb.setDefaultBlock(0);

            assert.equal(litetokensWeb.defaultBlock, 0);
        });

        it('should be able to clear', function () {
            const litetokensWeb = createInstance();

            litetokensWeb.setDefaultBlock();

            assert.equal(litetokensWeb.defaultBlock, false);
        });

        it('should accept "earliest"', function () {
            const litetokensWeb = createInstance();

            litetokensWeb.setDefaultBlock('earliest');

            assert.equal(litetokensWeb.defaultBlock, 'earliest');
        });

        it('should accept "latest"', function () {
            const litetokensWeb = createInstance();

            litetokensWeb.setDefaultBlock('latest');

            assert.equal(litetokensWeb.defaultBlock, 'latest');
        });

        it('should reject a decimal', function () {
            const litetokensWeb = createInstance();

            assert.throws(() => litetokensWeb.setDefaultBlock(10.2), 'Invalid block ID provided');
        });

        it('should reject a string', function () {
            const litetokensWeb = createInstance();

            assert.throws(() => litetokensWeb.setDefaultBlock('test'), 'Invalid block ID provided');
        });
    });

    describe('#setPrivateKey()', function () {
        it('should accept a private key', function () {
            const litetokensWeb = new LitetokensWeb(FULL_NODE_API, SOLIDITY_NODE_API, EVENT_API);

            litetokensWeb.setPrivateKey(PRIVATE_KEY);

            assert.equal(litetokensWeb.defaultPrivateKey, PRIVATE_KEY);
        });

        it('should set the appropriate address for the private key', function () {
            const litetokensWeb = new LitetokensWeb(FULL_NODE_API, SOLIDITY_NODE_API, EVENT_API);

            litetokensWeb.setPrivateKey(PRIVATE_KEY);

            assert.equal(litetokensWeb.defaultAddress.hex, ADDRESS_HEX);
            assert.equal(litetokensWeb.defaultAddress.base58, ADDRESS_BASE58);
        });

        it('should reject an invalid private key', function () {
            const litetokensWeb = new LitetokensWeb(FULL_NODE_API, SOLIDITY_NODE_API, EVENT_API);

            assert.throws(() => litetokensWeb.setPrivateKey('test'), 'Invalid private key provided');
        });

        it('should emit a privateKeyChanged event', function (done) {
            this.timeout(1000);

            const litetokensWeb = createInstance();

            litetokensWeb.on('privateKeyChanged', privateKey => {
                done(
                    assert.equal(privateKey, PRIVATE_KEY)
                );
            });

            litetokensWeb.setPrivateKey(PRIVATE_KEY);
        });
    });

    describe('#setAddress()', function () {
        it('should accept a hex address', function () {
            const litetokensWeb = createInstance();

            litetokensWeb.setAddress(ADDRESS_HEX);

            assert.equal(litetokensWeb.defaultAddress.hex, ADDRESS_HEX);
            assert.equal(litetokensWeb.defaultAddress.base58, ADDRESS_BASE58);
        });

        it('should accept a base58 address', function () {
            const litetokensWeb = createInstance();

            litetokensWeb.setAddress(ADDRESS_BASE58);

            assert.equal(litetokensWeb.defaultAddress.hex, ADDRESS_HEX);
            assert.equal(litetokensWeb.defaultAddress.base58, ADDRESS_BASE58);
        });

        it('should reset the private key if the address doesn\'t match', function () {
            const litetokensWeb = createInstance();

            assert.equal(litetokensWeb.defaultPrivateKey, PRIVATE_KEY);

            litetokensWeb.setAddress(
                ADDRESS_HEX.substr(0, ADDRESS_HEX.length - 1) + '8'
            );

            assert.equal(litetokensWeb.defaultPrivateKey, false);
            assert.equal(litetokensWeb.defaultAddress.hex, '30928c9af0651632157ef27a2cf17ca72c575a4d28');
            assert.equal(litetokensWeb.defaultAddress.base58, 'LYaqMeF8c8eUHqjktYVQSAoJ933ZhhyPum');
        });

        it('should not reset the private key if the address matches', function () {
            const litetokensWeb = createInstance();

            litetokensWeb.setAddress(ADDRESS_BASE58);

            assert.equal(litetokensWeb.defaultPrivateKey, PRIVATE_KEY);
        });

        it('should emit an addressChanged event', function (done) {
            this.timeout(1000);

            const litetokensWeb = createInstance();

            litetokensWeb.on('addressChanged', ({hex, base58}) => {
                done(
                    assert.equal(hex, ADDRESS_HEX) &&
                    assert.equal(base58, ADDRESS_BASE58)
                );
            });

            litetokensWeb.setAddress(ADDRESS_BASE58);
        });
    });

    describe('#isValidProvider()', function () {
        it('should accept a valid provider', function () {
            const litetokensWeb = createInstance();
            const provider = new HttpProvider(FULL_NODE_API);

            assert.equal(litetokensWeb.isValidProvider(provider), true);
        });

        it('should accept an invalid provider', function () {
            const litetokensWeb = createInstance();

            assert.equal(litetokensWeb.isValidProvider('test'), false);
        });
    });

    describe('#setFullNode()', function () {
        it('should accept a HttpProvider instance', function () {
            const litetokensWeb = createInstance();
            const provider = new HttpProvider(FULL_NODE_API);

            litetokensWeb.setFullNode(provider);

            assert.equal(litetokensWeb.fullNode, provider);
        });

        it('should accept a valid URL string', function () {
            const litetokensWeb = createInstance();
            const provider = FULL_NODE_API;

            litetokensWeb.setFullNode(provider);

            assert.equal(litetokensWeb.fullNode.host, provider);
        });

        it('should reject a non-string', function () {
            assert.throws(() => {
                createInstance().setFullNode(true)
            }, 'Invalid full node provided');
        });

        it('should reject an invalid URL string', function () {
            assert.throws(() => {
                createInstance().setFullNode('test')
            }, 'Invalid URL provided to HttpProvider');
        });
    });

    describe('#setSolidityNode()', function () {
        it('should accept a HttpProvider instance', function () {
            const litetokensWeb = createInstance();
            const provider = new HttpProvider(SOLIDITY_NODE_API);

            litetokensWeb.setSolidityNode(provider);

            assert.equal(litetokensWeb.solidityNode, provider);
        });

        it('should accept a valid URL string', function () {
            const litetokensWeb = createInstance();
            const provider = SOLIDITY_NODE_API;

            litetokensWeb.setSolidityNode(provider);

            assert.equal(litetokensWeb.solidityNode.host, provider);
        });

        it('should reject a non-string', function () {
            assert.throws(() => {
                createInstance().setSolidityNode(true)
            }, 'Invalid solidity node provided');
        });

        it('should reject an invalid URL string', function () {
            assert.throws(() => {
                createInstance().setSolidityNode('test')
            }, 'Invalid URL provided to HttpProvider');
        });
    });

    describe('#setEventServer()', function () {
        it('should accept a valid URL string', function () {
            const litetokensWeb = createInstance();
            const eventServer = EVENT_API;

            litetokensWeb.setEventServer(eventServer);

            assert.equal(litetokensWeb.eventServer.host, eventServer);
        });

        it('should reset the event server property', function () {
            const litetokensWeb = createInstance();

            litetokensWeb.setEventServer(false);

            assert.equal(litetokensWeb.eventServer, false);
        });

        it('should reject an invalid URL string', function () {
            const litetokensWeb = createInstance();

            assert.throws(() => {
                litetokensWeb.setEventServer('test')
            }, 'Invalid URL provided to HttpProvider');
        });

        it('should reject an invalid URL parameter', function () {
            const litetokensWeb = createInstance();

            assert.throws(() => {
                litetokensWeb.setEventServer({})
            }, 'Invalid event server provided');
        });
    });

    describe('#currentProviders()', function () {
        it('should return the current providers', function () {
            const litetokensWeb = createInstance();
            const providers = litetokensWeb.currentProviders();

            assert.equal(providers.fullNode.host, FULL_NODE_API);
            assert.equal(providers.solidityNode.host, SOLIDITY_NODE_API);
            assert.equal(providers.eventServer.host, EVENT_API);
        });
    });

    describe('#currentProvider()', function () {
        it('should return the current providers', function () {
            const litetokensWeb = createInstance();
            const providers = litetokensWeb.currentProvider();

            assert.equal(providers.fullNode.host, FULL_NODE_API);
            assert.equal(providers.solidityNode.host, SOLIDITY_NODE_API);
            assert.equal(providers.eventServer.host, EVENT_API);
        });
    });

    describe('#sha3()', function () {
        it('should match web3 sha function', function () {
            const input = 'casa';
            const expected = '0xc4388c0eaeca8d8b4f48786df8517bc8ca379e8cf9566af774448e46e816657d';

            assert.equal(LitetokensWeb.sha3(input), expected);
        });
    });


    describe('#utils.abi.decodeParams()', function () {
        it('should decode abi coded params passing types and output', function () {

            const litetokensWeb = createInstance();
            const types = ['string', 'string', 'uint8', 'bytes32', 'uint256'];
            const output = '0x00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000012dc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011506920446179204e30306220546f6b656e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035049450000000000000000000000000000000000000000000000000000000000';

            const expected = [
                'Pi Day N00b Token',
                'PIE',
                18,
                '0xdc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece7',
                0
            ];


            const result = litetokensWeb.utils.abi.decodeParams(types, output);

            for (let i = 0; i < expected.length; i++) {
                assert.equal(result[i], expected[i]);
            }
        });

        it('should decode abi coded params passing names, types and output', function () {

            const litetokensWeb = createInstance();
            const names = ['Token', 'Graph', 'Qty', 'Bytes', 'Total'];
            const types = ['string', 'string', 'uint8', 'bytes32', 'uint256'];
            const output = '0x00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000012dc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011506920446179204e30306220546f6b656e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035049450000000000000000000000000000000000000000000000000000000000';

            const expected = {
                Token: 'Pi Day N00b Token',
                Graph: 'PIE',
                Qty: 18,
                Bytes: '0xdc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece7',
                Total: 0
            };

            const result = litetokensWeb.utils.abi.decodeParams(names, types, output);
            for (let i in expected) {
                assert.equal(result[i], expected[i]);
            }
        });

        it('should throw if the string does not start with 0x', function () {

            const litetokensWeb = createInstance();
            const types = ['string', 'string', 'uint8', 'bytes32', 'uint256'];
            const output =
                '00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000012dc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011506920446179204e30306220546f6b656e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035049450000000000000000000000000000000000000000000000000000000000';

            assert.throws(() => {
                litetokensWeb.utils.abi.decodeParams(types, output)
            }, 'hex string must have 0x prefix');
        });

        it('should throw if the output format is wrong', function () {

            const litetokensWeb = createInstance();
            const types = ['string', 'string', 'uint8', 'bytes32', 'uint256'];
            const output = '0x00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000012dc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011506920446179204e30306220546f6b656e0000000000000000000000000000005049450000000000000000000000000000000000000000000000000000000000';

            assert.throws(() => {
                litetokensWeb.utils.abi.decodeParams(types, output)
            }, 'dynamic bytes count too large');
        });

        it('should throw if the output is invalid', function () {

            const litetokensWeb = createInstance();
            const types = ['string'];
            const output = '0x6630f88f000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000046173646600000000000000000000000000000000000000000000000000000000';

            assert.throws(() => {
                litetokensWeb.utils.abi.decodeParams(types, output)
            }, 'The encoded string is not valid. Its length must be a multiple of 64.');
        });

        it('should decode if the output is prefixed with the method hash', function () {

            const litetokensWeb = createInstance();
            const types = ['string'];
            const output = '0x6630f88f000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000046173646600000000000000000000000000000000000000000000000000000000';

            const result = litetokensWeb.utils.abi.decodeParams(types, output, true)
            assert.equal(result, 'asdf')
        });
    });


    describe('#utils.abi.encodeParams()', function () {
        it('should encode abi coded params passing types and values', function () {

            const litetokensWeb = createInstance();
            const types = ['string', 'string', 'uint8', 'bytes32', 'uint256'];
            const values = [
                'Pi Day N00b Token',
                'PIE',
                18,
                '0xdc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece7',
                0
            ];

            const expected = '0x00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000012dc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011506920446179204e30306220546f6b656e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035049450000000000000000000000000000000000000000000000000000000000';


            const result = litetokensWeb.utils.abi.encodeParams(types, values);

            for (let i = 0; i < expected.length; i++) {
                assert.equal(result[i], expected[i]);
            }
        });

        it('should encode abi coded params passing addresses in hex and base58 mode', function () {

            const litetokensWeb = createInstance();
            const types = ['string', 'address', 'address'];
            const values = [
                'Onwer',
                ADDRESS_HEX,
                ADDRESS_BASE58
            ];

            const expected = '0x0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000928c9af0651632157ef27a2cf17ca72c575a4d21000000000000000000000000928c9af0651632157ef27a2cf17ca72c575a4d2100000000000000000000000000000000000000000000000000000000000000054f6e776572000000000000000000000000000000000000000000000000000000';
            const result = litetokensWeb.utils.abi.encodeParams(types, values);

            for (let i = 0; i < expected.length; i++) {
                assert.equal(result[i], expected[i]);
            }
        });

    });
});
