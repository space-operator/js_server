import { Network } from 'alchemy-sdk';
import { CHAIN_ID_ETH, CHAIN_ID_SEPOLIA } from '@certusone/wormhole-sdk';

export function getNetworkVariables(networkName: string) {
  let network: Network,
    tokenBridge,
    wormholeCore,
    nftBridge,
    tokenBridgeSolana,
    wormholeCoreSolana,
    nftBridgeSolana,
    chainId;
  switch (networkName) {
    case 'mainnet':
      network = Network.ETH_MAINNET;
      tokenBridge = '0x3ee18B2214AFF97000D974cf647E7C347E8fa585';
      wormholeCore = '0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B';
      nftBridge = '0x6FFd7EdE62328b3Af38FCD61461Bbfc52F5651fE';
      wormholeCoreSolana = 'worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth';
      tokenBridgeSolana = 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb';
      nftBridgeSolana = 'WnFt12ZrnzZrFZkt2xsNsaNWoQribnuQ5B5FrDbwDhD';
      chainId = CHAIN_ID_ETH;
      break;
    case 'devnet':
    default:
      network = Network.ETH_SEPOLIA;
      tokenBridge = '0xDB5492265f6038831E89f495670FF909aDe94bd9';
      wormholeCore = '0x4a8bc80Ed5a4067f1CCf107057b8270E0cC11A78';
      nftBridge = '0x6a0B52ac198e4870e5F3797d5B403838a5bbFD99';
      wormholeCoreSolana = '3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5';
      tokenBridgeSolana = 'DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe';
      nftBridgeSolana = '2rHhojZ7hpu1zA91nvZmT8TqWWvMcKmmNBCr2mKTtMq4';
      chainId = CHAIN_ID_SEPOLIA;
      break;
  }
  return {
    network,
    tokenBridge,
    wormholeCore,
    nftBridge,
    tokenBridgeSolana,
    wormholeCoreSolana,
    nftBridgeSolana,
    chainId,
  };
}

interface Headers {
  accept: string;
  'accept-encoding': string;
  'cache-control': string;
  'content-length': string;
  'content-type': string;
  host: string;
  'postman-token': string;
  'user-agent': string;
  'x-amzn-trace-id': string;
  'x-forwarded-for': string;
  'x-forwarded-port': string;
  'x-forwarded-proto': string;
}

interface Http {
  method: string;
  path: string;
  protocol: string;
  sourceIp: string;
  userAgent: string;
}

interface RequestContext {
  accountId: string;
  apiId: string;
  domainName: string;
  domainPrefix: string;
  http: Http;
  requestId: string;
  routeKey: string;
  stage: string;
  time: string;
  timeEpoch: number;
}
export interface Body {
  networkName: string;
  token: string;
  keypair: string;
}

export interface Request {
  version: string;
  routeKey: string;
  rawPath: string;
  rawQueryString: string;
  headers: Headers;
  requestContext: RequestContext;
  body: Body;
  isBase64Encoded: boolean;
}

export function parseRequest(event: string): Request {
  console.log(event);
  const parsed: Request = JSON.parse(event);

  return parsed;
}

// const test_string = "{ version: '2.0', routeKey: 'POST /attest_from_eth', rawPath: '/attest_from_eth', rawQueryString: '', headers: { accept: '*/*', 'accept-encoding': 'gzip, deflate, br', 'cache-control': 'no-cache', 'content-length': '179', 'content-type': 'application/json', host: 'gygvoikm3c.execute-api.us-east-1.amazonaws.com', 'postman-token': 'f4d7bc8c-280a-40c8-a186-b5dc6df8bb0f', 'user-agent': 'PostmanRuntime/7.32.3', 'x-amzn-trace-id': 'Root=1-64bed546-44e457fe3eda066140f57f06', 'x-forwarded-for': '54.86.50.139', 'x-forwarded-port': '443', 'x-forwarded-proto': 'https' }, requestContext: { accountId: '586927300535', apiId: 'gygvoikm3c', domainName: 'gygvoikm3c.execute-api.us-east-1.amazonaws.com', domainPrefix: 'gygvoikm3c', http: { method: 'POST', path: '/attest_from_eth', protocol: 'HTTP/1.1', sourceIp: '54.86.50.139', userAgent: 'PostmanRuntime/7.32.3' }, requestId: 'IlZDHiVrIAMEJ6w=', routeKey: 'POST /attest_from_eth', stage: '$default', time: '24/Jul/2023:19:47:18 +0000', timeEpoch: 1690228038882 }, body: '{\n' + ' "networkName": "devnet",\n' + ' "token": "0xDB5492265f6038831E89f495670FF909aDe94bd9",\n' + ' "keypair": "0x1bb0ed141673d3228d6dc10806f0de5ee6522695160aed8fb99e487a9abc622c"\n' + ' }\n' + '\n', isBase64Encoded: false }";
