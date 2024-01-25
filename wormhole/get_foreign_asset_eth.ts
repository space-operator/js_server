import {
  ChainId,
  ChainName,
  getForeignAssetEth,
  tryNativeToUint8Array,
  nft_bridge,
} from '@certusone/wormhole-sdk';
import { Alchemy } from 'alchemy-sdk';
import { getNetworkVariables } from './utils.ts';
import { load } from 'https://deno.land/std@0.210.0/dotenv/mod.ts';

// https://github.com/wormhole-foundation/wormhole/blob/3ecc620eed3ed70bac11b006afcb72983f69f138/sdk/js/src/nft_bridge/__tests__/integration.ts#L80C43-L80C61
interface TransferFromEth {
  networkName: string;
  token: string;
  isNFT: boolean;
  chainId: ChainId | ChainName;
}

const env = await load();

export async function get_foreign_asset_eth(event: any) {
  // Inputs
  const { networkName, token, chainId, isNFT }: TransferFromEth = event;

  // Get network variables
  const { network, nftBridge, tokenBridge } = getNetworkVariables(networkName);

  // Setup Provider
  const settings = {
    apiKey: Deno.env.get('ALCHEMY_API_KEY'),
    network,
  };
  const alchemy = new Alchemy(settings);
  const provider = await alchemy.config.getProvider();

  // Get Address

  async function getAddress() {
    let address: string | null = '';

    if (isNFT) {
      address = await nft_bridge.getForeignAssetEth(
        nftBridge,
        provider,
        chainId,
        tryNativeToUint8Array(token, chainId)
      );
    } else {
      address = await getForeignAssetEth(
        tokenBridge,
        provider,
        chainId,
        tryNativeToUint8Array(token, chainId)
      );
    }
    return address;
  }
  const address = await getAddress();

  return {
    output: { address },
  };
}
