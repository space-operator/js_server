import { load } from 'https://deno.land/std@0.210.0/dotenv/mod.ts';
import {
  Client,
  SignatureRequest,
  StartFlowUnverifiedOutput,
  Value,
  WsClient,
} from 'npm:@space-operator/client';
import { PublicKey } from 'npm:@solana/web3.js@^1.91.4';
import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from 'npm:@solana/actions';

// https://github.com/wormhole-foundation/wormhole/blob/3ecc620eed3ed70bac11b006afcb72983f69f138/sdk/js/src/nft_bridge/__tests__/integration.ts#L80C43-L80C61
interface Test {
  amount: string;
}

const env = await load();

export function prepFlowInputs(inputs: any, wallet: PublicKey) {
  const walletBase58 = wallet.toBase58();
  const jsonStr = JSON.stringify(inputs).replace(
    /WALLET_ADAPTER/g,
    walletBase58
  );
  return JSON.parse(jsonStr);
}

export const restClient = new Client({
  host: env.NEXT_PUBLIC_FLOW_INSTANCE_URL,
});
export const wsClient = new WsClient({
  url: env.NEXT_PUBLIC_FLOW_INSTANCE_WS,
});

export async function test(event: any) {
  const account = new PublicKey('6zRQ5NKwbWerK92qrvDC2kr2KmsifaMUCjoJxPGAMNMA');

  // Inputs
  const { amount }: Test = event;
  const flowId = 2162;
  const recipient = new PublicKey(
    '6zRQ5NKwbWerK92qrvDC2kr2KmsifaMUCjoJxPGAMNMA'
  );

  const inputBody = new Value({
    sender: 'WALLET_ADAPTER',
    recipient,
    amount,
  }).M;

  const preppedInputBody = prepFlowInputs(inputBody, account);
  console.log('inputBody', preppedInputBody);

  let responsePayload: ActionPostResponse | null = null;

  await restClient
    .startFlowUnverified(flowId, account, {
      inputs: preppedInputBody,
    })
    .then(async (res) => {
      const { flow_run_id, token } = res as StartFlowUnverifiedOutput;
      if (res.error) {
        throw res.error;
      }
      await wsClient
        .subscribeFlowRunEvents(
          async (ev) => {
            console.log('ev', ev);
            if (ev.event === 'SignatureRequest') {
              console.log('ev', ev);
              const req = new SignatureRequest({
                id: ev.data.id,
                message: ev.data.message,
                pubkey: ev.data.pubkey,
                signatures: ev.data.signatures,
                flow_run_id: ev.data.flow_run_id,
                time: '', // not needed
                timeout: 0, // not needed
              });

              const pk = new PublicKey(req.pubkey);
              if (!account.equals(pk)) {
                throw `different public key:\nrequested: ${
                  req.pubkey
                }}\nwallet: ${account.toBase58()}`;
              }

              let tx = req.buildTransaction();
              console.log('tx', tx);

              responsePayload = await createPostResponse({
                fields: {
                  transaction: tx,
                  message: 'Post this memo on-chain',
                },
                // no additional signers are required for this transaction
                // signers: [],
              });
            }
          },
          flow_run_id,
          token
        )
        .then(() => {
          if (responsePayload) {
            return Response.json(responsePayload, {
              headers: ACTIONS_CORS_HEADERS,
            });
          } else {
            throw new Error('No signature request received');
          }
        });
    });
  //   if (responsePayload) {
  //     return Response.json(responsePayload, {
  //       headers: ACTIONS_CORS_HEADERS,
  //     });
  //   } else {
  //     throw new Error('No signature request received');
  //   }

  return {
    output: { message: 'test' },
  };
}
