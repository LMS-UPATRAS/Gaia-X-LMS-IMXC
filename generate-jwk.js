import { importX509, exportJWK } from 'jose';
import fs from 'fs';

async function main() {
  const cert = fs.readFileSync('./certificate.pem', 'utf8');

  const key = await importX509(cert, 'PS256');
  const jwk = await exportJWK(key);

  console.log(JSON.stringify(jwk, null, 2));
}

main();
