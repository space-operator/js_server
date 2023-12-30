import { ethers, utils } from 'ethers';
import {
  CHAIN_ID_SOLANA,
  approveEth,
  getEmitterAddressEth,
  parseSequenceFromLogEth,
  transferFromEth,
  tryNativeToUint8Array,
} from '@certusone/wormhole-sdk';

import { Alchemy } from 'alchemy-sdk';
import { Body, getNetworkVariables, parseRequest } from '../utils.ts';

import { load } from 'https://deno.land/std@0.210.0/dotenv/mod.ts';
import {
  decode as base64Decode,
  encode as base64Encode,
} from 'https://deno.land/std@0.166.0/encoding/base64.ts';

//https://github.com/wormhole-foundation/wormhole/blob/main/sdk/js/src/token_bridge/__tests__/eth-integration.ts#L20

const env = await load();

interface TransferFromEth {
  networkName: string;
  token: string;
  keypair: string;
  recipient: string;
  amount: string;
}

export async function transfer_from_eth(event: any) {
  // Inputs
  // replace `JSON.parse(event.body)` with `event` for local testing
  const { networkName, token, keypair, recipient, amount }: TransferFromEth =
    event;

  // Get network variables
  let { network, tokenBridge, wormholeCore } = getNetworkVariables(networkName);

  // Setup Provider
  const settings = {
    apiKey: env['ALCHEMY_API_KEY'],
    network,
  };
  const alchemy = new Alchemy(settings);
  const provider = await alchemy.config.getProvider();

  // Setup signer
  const signer = new ethers.Wallet(keypair, provider);

  const amountParsed = utils.parseUnits(amount, 18);
  console.log(amountParsed);
  // approve the bridge to spend tokens
  await approveEth(tokenBridge, token, signer, amountParsed);
  // transfer tokens
  const receipt = await transferFromEth(
    tokenBridge,
    signer,
    token,
    amountParsed,
    CHAIN_ID_SOLANA,
    tryNativeToUint8Array(recipient.toString(), CHAIN_ID_SOLANA),
    undefined,
    {
      gasLimit: 2000000,
    }
  );

  // Get the sequence from the logs (needed to fetch the vaa)
  const sequence = parseSequenceFromLogEth(receipt, wormholeCore);

  const emitterAddress = getEmitterAddressEth(tokenBridge);

  return {
    output: { receipt, emitterAddress, sequence },
  };
}

// sls invoke local --function transfer_from_eth --path ./src/transfer_from_eth/mock_transfer_from_eth.json
