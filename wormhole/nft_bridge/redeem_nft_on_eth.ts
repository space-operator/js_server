import { ethers } from 'ethers';
import {
  CHAIN_ID_SOLANA,
  createWrappedOnEth,
  getForeignAssetEth,
  hexToUint8Array,
  tryNativeToHexString,
  tryNativeToUint8Array,
  nft_bridge,
} from '@certusone/wormhole-sdk';
import { Alchemy } from 'alchemy-sdk';
import { getNetworkVariables } from '../utils.ts';
import { load } from 'https://deno.land/std@0.210.0/dotenv/mod.ts';
import { decode as base64Decode } from 'https://deno.land/std@0.166.0/encoding/base64.ts';

//https://github.com/wormhole-foundation/wormhole/blob/main/sdk/js/src/token_bridge/__tests__/eth-integration.ts#L20

const env = await load();

interface RedeemOnEth {
  networkName: string;
  keypair: string;
  signedVAA: string; /// need to be uint8array
}

export async function redeem_nft_on_eth(event: any) {
  // Inputs
  const { networkName, keypair, signedVAA }: RedeemOnEth = event;

  // Get network variables
  const { network, nftBridge, wormholeCore } = getNetworkVariables(networkName);

  // Setup Provider
  const settings = {
    apiKey: Deno.env.get('ALCHEMY_API_KEY'), //Deno.env.get('ALCHEMY_API_KEY'),
    network,
  };
  const alchemy = new Alchemy(settings);
  const provider = await alchemy.config.getProvider();

  // const uint8Array = Uint8Array.from(atob(signedVAA), (c) => c.charCodeAt(0));
  const buffer = base64Decode(signedVAA);

  // Setup signer
  const signer = new ethers.Wallet(keypair, provider);

  let receipt;
  try {
    const gasPrice = await provider.getGasPrice();

    receipt = await nft_bridge.redeemOnEth(nftBridge, signer, buffer, {
      gasLimit: 4000000,
      gasPrice: gasPrice.mul(2),
    });
    console.log(receipt);
  } catch (error) {
    console.log(error);
  }

  return {
    output: { receipt },
  };
}
