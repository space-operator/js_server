import { ethers } from 'ethers';
import {
  CHAIN_ID_SOLANA,
  createWrappedOnEth,
  getForeignAssetEth,
  hexToUint8Array,
  redeemOnEth,
  tryNativeToHexString,
  tryNativeToUint8Array,
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
    apiKey: env['ALCHEMY_API_KEY'],
    network,
  };
  const alchemy = new Alchemy(settings);
  const provider = await alchemy.config.getProvider();

  // const uint8Array = Uint8Array.from(atob(signedVAA), (c) => c.charCodeAt(0));
  const buffer = base64Decode(signedVAA);

  // Setup signer
  const signer = new ethers.Wallet(keypair, provider);

  const receipt = await redeemOnEth(nftBridge, signer, buffer, {
    gasLimit: 2000000,
    
  });
  console.log(receipt);
  return {
    output: { receipt },
  };
}

// sls invoke local --function redeem_nft_on_eth --path ./src/redeem_nft_on_eth/mock_redeem_nft_on_eth.json
