import { ethers } from 'ethers';
import {
  attestFromEth,
  getEmitterAddressEth,
  parseSequenceFromLogEth,
} from '@certusone/wormhole-sdk';
import { Alchemy } from 'alchemy-sdk';
import { Body, getNetworkVariables, parseRequest } from '../utils.ts';
import { load } from 'https://deno.land/std@0.210.0/dotenv/mod.ts';

//https://github.com/wormhole-foundation/wormhole/blob/main/sdk/js/src/token_bridge/__tests__/eth-integration.ts#L20

const env = await load();

export async function attest_from_eth(event: any) {
  // Inputs
  const { networkName, token, keypair }: Body = event;

  // Get network variables
  const { network, tokenBridge, wormholeCore } = getNetworkVariables(networkName);

  // Setup Provider
  const settings = {
    apiKey: env['ALCHEMY_API_KEY'],
    network,
  };
  const alchemy = new Alchemy(settings);
  const provider = await alchemy.config.getProvider();

  // Setup signer
  const signer = new ethers.Wallet(keypair, provider);

  // Attest
  const receipt = await attestFromEth(tokenBridge, signer, token, {
    gasLimit: 100000,
  });

  // Get the sequence from the logs (needed to fetch the vaa)
  const sequence = parseSequenceFromLogEth(receipt, wormholeCore);

  const emitterAddress = getEmitterAddressEth(tokenBridge);

  return {
    output: { receipt, emitterAddress, sequence },
  };
}
