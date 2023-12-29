import { Hono } from 'https://deno.land/x/hono@v3.4.1/mod.ts';
import { create_wrapped_on_eth } from './wormhole/token_bridge/create_wrapped_on_eth.ts';
import { redeem_on_eth } from './wormhole/token_bridge/redeem_on_eth.ts';

const app = new Hono();

app.get('/', (c) => c.text('Welcome to dinosaur API!'));

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

// app.get('/api/:dinosaur', (c) => {
//   const dinosaur = c.req.param('dinosaur').toLowerCase();
//   const found = data.find((item) => item.name.toLowerCase() === dinosaur);
//   if (found) {
//     return c.json(found);
//   } else {
//     return c.text('No dinosaurs found.');
//   }
// });

Deno.serve(app.fetch);
