<p align="center">
  <a href="https://discord.gg/GsRgsTD">
    <img src="https://img.shields.io/badge/chat-on%20discord-brightgreen.svg">
  </a>

  <a href="https://github.com/litetokens/litetokens-web/issues">
    <img src="https://img.shields.io/github/issues/litetokens/litetokens-web.svg">
  </a>

  <a href="https://github.com/litetokens/litetokens-web/pulls">
    <img src="https://img.shields.io/github/issues-pr/litetokens/litetokens-web.svg">
  </a>

  <a href="https://github.com/litetokens/litetokens-web/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/litetokens/litetokens-web.svg">
  </a>

  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/litetokens/litetokens-web.svg">
  </a>
</p>

## What is LitetokensWeb?

__[Litetokens Web - Developer Document](https://developers.litetokens.org)__

LitetokensWeb aims to deliver a unified, seamless development experience influenced by Ethereum's [Web3](https://github.com/ethereum/web3.js/) implementation. We have taken the core ideas and expanded upon it to unlock the functionality of LITETOKENS's unique feature set along with offering new tools for integrating DApps in the browser, Node.js and IoT devices.

## Compatibility
- Version built for Node.js v6 and above
- Version built for browsers with more than 0.25% market share

You can access either version specifically from the `dist/` folder.

LitetokensWeb is also compatible with frontend frameworks such as Angular, React and Vue.

You can also ship LitetokensWeb in a Chrome extension.

## Installation

```
npm install litetokensweb
```

## Example

To look at the examples, first clone this repo, install the dependencies and run the example:
```
git clone https://github.com/litetokens/litetokens-web.git
cd litetokens-web
yarn
yarn build -d
yarn example
```
The example is at `examples/server/index.js`.

## LITETOKENS provides a private network to test with

* Full Node - https://api.shasta.litescan.org
* Solidity Node - https://api.shasta.litescan.org
* Event Server - https://api.shasta.litescan.org
* Block Explorer - https://explorer.shasta.litescan.org

* You can also set up your own private network, but you need to solve cross-domain CORS. The following example in Node reads from a full node listening on 16667 and a solidity node listening on 16668, and exposes the ports 8090 and 8091 with the needed headers.

```
var express = require('express');
var proxy = require('http-proxy-middleware');

function onProxyRes(proxyRes, req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  console.log(req.originalUrl)
}

var fullnode = express();
fullnode.use('/', proxy({
  target: 'http://127.0.0.1:16667',
  changeOrigin: true,
  onProxyRes
}));
fullnode.listen(8090);

var soliditynode = express();
soliditynode.use('/', proxy({
  target: 'http://127.0.0.1:16668',
  changeOrigin: true,
  onProxyRes,
  onError
}));
soliditynode.listen(8091);
```


## Creating an Instance

First off, in your javascript file, define LitetokensWeb:

```js
const LitetokensWeb = require('litetokensweb')
```
Specify the API endpoints:
```js
const HttpProvider = LitetokensWeb.providers.HttpProvider;
const fullNode = new HttpProvider('https://api.litescan.org'); // Full node http endpoint
const solidityNode = new HttpProvider('https://api.litescan.org:'); // Solidity node http endpoint
const eventServer = 'https://api.litescan.org'; // Contract events http endpoint
```
The provider above is optional, you can just use a url for the nodes instead, like here:

```js
const fullNode = 'https://api.litescan.org';
const solidityNode = 'https://api.litescan.org';
const eventServer = 'https://api.litescan.org/';
```
Now, instance a litetokensWeb object:
```js
const privateKey = 'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0';

const litetokensWeb = new LitetokensWeb(
    fullNode,
    solidityNode,
    eventServer,
    privateKey
);
```
#### A full example:
```js
const LitetokensWeb = require('litetokensweb')

const HttpProvider = LitetokensWeb.providers.HttpProvider; // This provider is optional, you can just use a url for the nodes instead
const fullNode = new HttpProvider('https://api.litescan.org'); // Full node http endpoint
const solidityNode = new HttpProvider('https://api.litescan.org'); // Solidity node http endpoint
const eventServer = 'https://api.litescan.org/'; // Contract events http endpoint

const privateKey = 'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0';

const litetokensWeb = new LitetokensWeb(
    fullNode,
    solidityNode,
    eventServer,
    privateKey
);


async function getBalance() {

    const address = 'LYaqMeF8c8eUHqjktYVQSAoJ933YthjNA1';

    // The majority of the function calls are asynchronus,
    // meaning that they cannot return the result instantly.
    // These methods therefore return a promise, which you can await.
    const balance = await litetokensWeb.xlt.getBalance(address);
    console.log({balance});

    // You can also bind a `then` and `catch` method.
    litetokensWeb.xlt.getBalance(address).then(balance => {
        console.log({balance});
    }).catch(err => console.error(err));

    // If you'd like to use a similar API to Web3, provide a callback function.
    litetokensWeb.xlt.getBalance(address, (err, balance) => {
        if (err)
            return console.error(err);

        console.log({balance});
    });
}

getBalance();

```
#### Note:

For testing LitetokensWeb API functions, it would be best to setup a private network on your local machine using the <a href="https://developers.litetokens.org" target="_blank">LITETOKENS Developer Docs</a>. The Docker guide sets up a Full Node, Solidity Node, and Event Server on your machine. You can then deploy smart contracts on your network and interact with them via LitetokensWeb. If you wish to test LitetokensWeb with other users, it would be best to deploy your contracts/DApps on the Shasta test network and interact from there.
