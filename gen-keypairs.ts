import { Keypair } from 'npm:@solana/web3.js@^1.91.4';
import { ensureFile } from 'https://deno.land/std@0.190.0/fs/ensure_file.ts';
import { writeCSV } from 'https://deno.land/x/csv@v0.1.0/mod.ts';

async function generateKeypairsAndWriteToCSV(
  numKeypairs: number,
  outputPath: string
) {
  await ensureFile(outputPath);

  const records = [];

  for (let i = 0; i < numKeypairs; i++) {
    const keypair = Keypair.generate();
    const keypairString = JSON.stringify(Array.from(keypair.secretKey));
    const pubkeyString = keypair.publicKey.toString();

    records.push([keypairString, pubkeyString]); 
  }

  const file = await Deno.open(outputPath, {
    write: true,
    create: true,
    truncate: true,
  });
  await writeCSV(file, [['keypair', 'pubkey']]);
  await writeCSV(file, records);
  file.close();

  console.log('CSV file written successfully');
}

generateKeypairsAndWriteToCSV(1000, 'keypairs.csv');
