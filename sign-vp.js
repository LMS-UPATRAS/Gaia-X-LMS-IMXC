import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config(); // Load .env

async function main() {
  try {
    // Read input JSON files
    const application = JSON.parse(fs.readFileSync('./application.json', 'utf8'));
    const participant = JSON.parse(fs.readFileSync('./participant.json', 'utf8'));

    // Build the Verifiable Presentation (VP)
    const vp = {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://w3id.org/gaia-x/development#"
      ],
      "type": ["VerifiablePresentation"],
      "holder": participant.credentialSubject.id,
      "verifiableCredential": [participant, application]
    };

    // Use the exact HTTPS URL of your DID JSON from .env
    const didWebUrl = process.env.DID_WEB_URL; 
    if (!didWebUrl) {
      throw new Error("❌ DID_WEB_URL not defined in .env");
    }

    // Build the VC ID URL by replacing did.json with compliance-vc.jwt
    const vcid = didWebUrl.replace(/did\.json$/, 'compliance-vc.jwt');

    // Send VP to local compliance engine for validation/signing
    const response = await axios.post(
      `http://localhost:3000/validateFromJson?vcid=${encodeURIComponent(vcid)}`,
      vp,
      { headers: { "Content-Type": "application/json" } }
    );

    const vcJwt = response.data.signedComplianceCredentialJwt;

    console.log("\n✅ FINAL VC JWT:\n", vcJwt);

    // Save the signed VC JWT locally
    fs.mkdirSync(".well-known", { recursive: true });
    fs.writeFileSync(".well-known/compliance-vc.jwt", vcJwt);

    console.log("\n📁 Saved to .well-known/compliance-vc.jwt");

  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
}

main();
