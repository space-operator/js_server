import { ethers } from 'ethers';
import {
  CHAIN_ID_SOLANA,
  getEmitterAddressEth,
  parseSequenceFromLogEth,
  tryNativeToUint8Array,
  nft_bridge,
} from '@certusone/wormhole-sdk';
import { Alchemy } from 'alchemy-sdk';
import { getNetworkVariables } from '../utils.ts';
import { load } from 'https://deno.land/std@0.210.0/dotenv/mod.ts';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

//https://github.com/wormhole-foundation/wormhole/blob/main/sdk/js/src/token_bridge/__tests__/eth-integration.ts#L20
const env = await load();

interface TransferNftFromEth {
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
  const {
    networkName,
    token,
    tokenId,
    keypair,
    recipient,
  }: TransferNftFromEth = event;
  console.log(event);
  // Get network variables
  const { network, nftBridge, wormholeCore, chainId, nftBridgeSolana } =
    getNetworkVariables(networkName);

  // Setup Provider
  const settings = {
    apiKey: env['ALCHEMY_API_KEY'],
    network,
  };
  const alchemy = new Alchemy(settings);
  const provider = await alchemy.config.getProvider();

  // Setup signer
  const signer = new ethers.Wallet(keypair, provider);

  // Get Mint Address on Solana
  const tokenAddress = tryNativeToUint8Array(token, chainId);

  // const seeds = [
  //   new TextEncoder().encode('wrapped'),
  //   (() => {
  //     const buf = new DataView(new ArrayBuffer(4));
  //     buf.setUint16(0, chainId as number, false); // false for big-endian
  //     return new Uint8Array(buf.buffer);
  //   })(),
  //   typeof tokenAddress === 'string'
  //     ? new TextEncoder().encode(tokenAddress)
  //     : new Uint8Array(tokenAddress),
  //   new TextEncoder().encode(tokenId),
  // ];

  // const solanaMintKey = PublicKey.findProgramAddressSync(
  //   seeds,
  //   new PublicKey('2rHhojZ7hpu1zA91nvZmT8TqWWvMcKmmNBCr2mKTtMq4')
  // )[0];

  const solanaMintKey = await nft_bridge.getForeignAssetSolana(
    new PublicKey(nftBridgeSolana),
    chainId,
    tokenAddress,
    tokenId
  );
  console.log(solanaMintKey, 'solanaMintKey');

  // Get associated token address
  const recipient_ata = await getAssociatedTokenAddress(
    new PublicKey(solanaMintKey),
    new PublicKey(recipient)
  );
  console.log(recipient_ata.toString(), 'recipient_ata');

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
      tryNativeToUint8Array(recipient_ata.toString(), CHAIN_ID_SOLANA),
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
    output: {
      receipt,
      emitterAddress,
      sequence,
      recipient_ata: recipient_ata.toString(),
      mint: solanaMintKey.toString(),
    },
  };
}
