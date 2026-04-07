import forge from 'node-forge';
import fs from 'fs';

// 1. Generate RSA Key Pair
console.log("⏳ Generating 4096-bit RSA keys...");
const keys = forge.pki.rsa.generateKeyPair(4096);
const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
fs.writeFileSync('private-key.pem', privateKeyPem);

// 2. Create a Self-Signed Certificate
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [
  { name: 'commonName', value: 'lms-upatras.github.io' },
  { name: 'countryName', value: 'GR' },
  { shortName: 'ST', value: 'Peloponnese' },
  { name: 'localityName', value: 'Patras' },
  { name: 'organizationName', value: 'University of Patras' },
  { shortName: 'OU', value: 'LMS' }
];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.sign(keys.privateKey, forge.md.sha256.create());

// 3. Export for did.json
const pem = forge.pki.certificateToPem(cert);
// Clean the certificate for the x5c array
const x5c = pem.replace(/-----BEGIN CERTIFICATE-----|\r?\n|\r|-----END CERTIFICATE-----/g, '');

// FIX: Use Node.js Buffer for safe Base64URL encoding of the Modulus (n)
const nBuffer = Buffer.from(keys.publicKey.n.toByteArray());
// RSA Modulus sometimes has a leading 00 byte to keep it positive; we strip it if it exists
const cleanN = nBuffer[0] === 0 ? nBuffer.subarray(1) : nBuffer;
const n = cleanN.toString('base64url');

console.log("✅ New Secure Identity Created!");
console.log("\n--- COPY THIS x5c ARRAY VALUE TO YOUR did.json ---");
console.log(JSON.stringify([x5c]));
console.log("\n--- COPY THIS n VALUE TO YOUR did.json ---");
console.log(n);

// 4. Save the certificate for GitHub (.well-known)
if (!fs.existsSync('./.well-known')) fs.mkdirSync('./.well-known');
fs.writeFileSync('./.well-known/x509CertificateChain.pem', pem);
console.log("\n📁 Certificate saved to .well-known/x509CertificateChain.pem");