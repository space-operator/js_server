import { ethers } from 'ethers';
import {
  CHAIN_ID_SOLANA,
  createWrappedOnEth,
  getForeignAssetEth,
  hexToUint8Array,
  tryNativeToHexString,
  tryNativeToUint8Array,
} from '@certusone/wormhole-sdk';
import { Alchemy } from 'alchemy-sdk';
import { getNetworkVariables } from '../utils.ts';

import { load } from 'https://deno.land/std@0.210.0/dotenv/mod.ts';
import {
  decode as base64Decode,
  encode as base64Encode,
} from 'https://deno.land/std@0.166.0/encoding/base64.ts';

//https://github.com/wormhole-foundation/wormhole/blob/main/sdk/js/src/token_bridge/__tests__/eth-integration.ts#L20

const env = await load();

interface CreateWrappedOnEth {
  networkName: string;
  keypair: string;
  signedVAA: string; /// need to be uint8array
  token: string;
}

export async function create_wrapped_on_eth(event: any) {
  // Inputs
  // replace `JSON.parse(event.body)` with `event` for local testing
  const { networkName, keypair, signedVAA, token }: CreateWrappedOnEth = event;

  // Get network variables
  const { network, tokenBridge, wormholeCore } =
    getNetworkVariables(networkName);

  // Setup Provider
  const settings = {
    apiKey: Deno.env.get('ALCHEMY_API_KEY'),
    network,
  };
  const alchemy = new Alchemy(settings);
  const provider = await alchemy.config.getProvider();

  // const uint8Array = Uint8Array.from(atob(signedVAA), (c) => c.charCodeAt(0));
  const buffer = base64Decode(signedVAA);

  // Setup signer
  const signer = new ethers.Wallet(keypair, provider);

  let receipt, originAssetHex, foreignAsset, address;
  try {
    const gasPrice = await provider.getGasPrice();

    receipt = await createWrappedOnEth(tokenBridge, signer, buffer, {
      gasLimit: 4000000,
      gasPrice: gasPrice.mul(2),
    });
    console.log(receipt);
    originAssetHex = tryNativeToHexString(token, CHAIN_ID_SOLANA);

    foreignAsset = await getForeignAssetEth(
      tokenBridge,
      provider,
      CHAIN_ID_SOLANA,
      hexToUint8Array(originAssetHex)
    );

    address = await getForeignAssetEth(
      tokenBridge,
      provider,
      'solana',
      tryNativeToUint8Array(token, 'solana')
    );
  } catch (error) {
    console.log(error);
  }

  console.log(originAssetHex, foreignAsset, address);

  return {
    output: { receipt, address },
  };
}
