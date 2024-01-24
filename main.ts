import { Hono } from 'https://deno.land/x/hono@v3.4.1/mod.ts';
import { create_wrapped_on_eth } from './wormhole/token_bridge/create_wrapped_on_eth.ts';
import { redeem_on_eth } from './wormhole/token_bridge/redeem_on_eth.ts';
import { transfer_from_eth } from './wormhole/token_bridge/transfer_from_eth.ts';
import { attest_from_eth } from './wormhole/token_bridge/attest_from_eth.ts';
import { redeem_nft_on_eth } from './wormhole/nft_bridge/redeem_nft_on_eth.ts';
import { transfer_nft_from_eth } from './wormhole/nft_bridge/transfer_nft_from_eth.ts';
import { get_foreign_asset_eth } from './wormhole/get_foreign_asset_eth.ts';

const app = new Hono();

app.get('/', (c) => c.text('Welcome to the Space Operator Wormhole API!'));

app.post('/api/create_wrapped_on_eth', async (c) => {
  const body = await c.req.json();
  // console.log(body);
  const output = await create_wrapped_on_eth(body);
  const response = new Response(JSON.stringify(output), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });

  console.log(response);
  return response;
});

app.post('/api/redeem_on_eth', async (c) => {
  const body = await c.req.json();
  // console.log(body);
  const output = await redeem_on_eth(body);
  const response = new Response(JSON.stringify(output), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });

  console.log(response);
  return response;
});

app.post('/api/transfer_from_eth', async (c) => {
  const body = await c.req.json();
  // console.log(body);
  const output = await transfer_from_eth(body);
  const response = new Response(JSON.stringify(output), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });

  console.log(response);
  return response;
});

app.post('/api/attest_from_eth', async (c) => {
  const body = await c.req.json();
  // console.log(body);
  const output = await attest_from_eth(body);
  const response = new Response(JSON.stringify(output), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });

  console.log(response);
  return response;
});

app.post('/api/redeem_nft_on_eth', async (c) => {
  const body = await c.req.json();
  // console.log(body);
  const output = await redeem_nft_on_eth(body);
  const response = new Response(JSON.stringify(output), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });

  console.log(response);
  return response;
});

app.post('/api/transfer_nft_from_eth', async (c) => {
  const body = await c.req.json();
  // console.log(body);
  const output = await transfer_nft_from_eth(body);
  const response = new Response(JSON.stringify(output), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });

  console.log(response);
  return response;
});

app.post('/api/get_foreign_asset_eth', async (c) => {
  const body = await c.req.json();
  // console.log(body);
  const output = await get_foreign_asset_eth(body);
  const response = new Response(JSON.stringify(output), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });

  console.log(response);
  return response;
});

Deno.serve(app.fetch);
