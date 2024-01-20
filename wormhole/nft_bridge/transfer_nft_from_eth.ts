import { ethers } from 'ethers';
import {
  CHAIN_ID_SOLANA,
  approveEth,
  getEmitterAddressEth,
  parseSequenceFromLogEth,
  tryNativeToUint8Array,
  nft_bridge,
} from '@certusone/wormhole-sdk';
import { Alchemy } from 'alchemy-sdk';
import { getNetworkVariables } from '../utils.ts';
import { parseUnits } from 'ethers/lib/utils';
import { load } from 'https://deno.land/std@0.210.0/dotenv/mod.ts';

//https://github.com/wormhole-foundation/wormhole/blob/main/sdk/js/src/token_bridge/__tests__/eth-integration.ts#L20
const env = await load();

interface TransferFromEth {
  networkName: string;
  token: string;
  keypair: string;
  recipient: string;
  amount: string;
  tokenId: string;
}

export async function transfer_nft_from_eth(event: any) {
  // Inputs
  // replace `JSON.parse(event.body)` with `event` for local testing
  const { networkName, token, tokenId, keypair, recipient }: TransferFromEth =
    event;
  console.log(event);
  // Get network variables
  const { network, nftBridge, wormholeCore } = getNetworkVariables(networkName);

  // Setup Provider
  const settings = {
    apiKey: env['ALCHEMY_API_KEY'],
    network,
  };
  const alchemy = new Alchemy(settings);
  const provider = await alchemy.config.getProvider();

  // Setup signer
  const signer = new ethers.Wallet(keypair, provider);

  // approve the bridge to spend tokens
  // transfer tokens
  let receipt, emitterAddress, sequence;
  try {
    // approve = await approveEth(nftBridge, token, signer, tokenId);
    // console.log(approve);
    receipt = await nft_bridge.transferFromEth(
      nftBridge,
      signer,
      token,
      tokenId,
      CHAIN_ID_SOLANA,
      tryNativeToUint8Array(recipient.toString(), CHAIN_ID_SOLANA),
      {
        gasLimit: 2000000,
      }
    );
    // Get the sequence from the logs (needed to fetch the vaa)
    sequence = parseSequenceFromLogEth(receipt, wormholeCore);

    emitterAddress = getEmitterAddressEth(nftBridge);
  } catch (error) {
    console.error(error);
  }
  return {
    output: { receipt, emitterAddress, sequence },
  };
}
