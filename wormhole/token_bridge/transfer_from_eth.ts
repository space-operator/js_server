import { ethers, utils } from 'ethers';
import {
  CHAIN_ID_SOLANA,
  approveEth,
  getEmitterAddressEth,
  parseSequenceFromLogEth,
  transferFromEth,
  tryNativeToUint8Array,
  token_bridge,
} from '@certusone/wormhole-sdk';

import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

import { Alchemy } from 'alchemy-sdk';
import { getNetworkVariables } from '../utils.ts';

import { load } from 'https://deno.land/std@0.210.0/dotenv/mod.ts';

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
  const { networkName, token, keypair, recipient, amount }: TransferFromEth =
    event;

  // Get network variables
  const { network, tokenBridge, wormholeCore, chainId, tokenBridgeSolana } =
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

  // Parse amount
  const amountParsed = utils.parseUnits(amount, 18);

  // Get Mint Address on Solana
  const tokenAddress = tryNativeToUint8Array(token, chainId);

  const seeds = [
    new TextEncoder().encode('wrapped'),
    (() => {
      const buf = new DataView(new ArrayBuffer(2));
      buf.setUint16(0, chainId as number, false); // false for big-endian
      return new Uint8Array(buf.buffer);
    })(),
    typeof tokenAddress === 'string'
      ? new TextEncoder().encode(tokenAddress)
      : new Uint8Array(tokenAddress),
  ];

  const solanaMintKey = PublicKey.findProgramAddressSync(
    seeds,
    new PublicKey(tokenBridgeSolana)
  )[0];

  console.log(solanaMintKey, 'solanaMintKey');

  let receipt, emitterAddress, sequence, recipient_ata;
  try {
    // Get associated token address
    recipient_ata = await getAssociatedTokenAddress(
      solanaMintKey,
      new PublicKey(recipient)
    );
    console.log(recipient_ata.toString(), 'recipient_ata');

    // get current gas prices
    const gasPrice = await provider.getGasPrice();

    // approve the bridge to spend tokens
    await approveEth(tokenBridge, token, signer, amountParsed, {
      gasPrice,
    });

    // transfer tokens
    receipt = await transferFromEth(
      tokenBridge,
      signer,
      token,
      amountParsed,
      CHAIN_ID_SOLANA,
      tryNativeToUint8Array(recipient_ata.toString(), CHAIN_ID_SOLANA),
      undefined,
      {
        gasLimit: 4000000,
        gasPrice: gasPrice.mul(2),
      }
    );

    // Get the sequence from the logs (needed to fetch the vaa)
    sequence = parseSequenceFromLogEth(receipt, wormholeCore);

    emitterAddress = getEmitterAddressEth(tokenBridge);
  } catch (error) {
    console.error(error);
  }

  return {
    output: {
      receipt,
      emitterAddress,
      sequence,
      recipient_ata: recipient_ata?.toString() ?? '',
      mint: solanaMintKey.toString(),
    },
  };
}
