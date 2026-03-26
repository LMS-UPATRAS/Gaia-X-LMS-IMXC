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

    // Send VP to local compliance engine for signing
    const response = await axios.post(
      `http://localhost:3000/validateFromJson`,
      vp,
      { headers: { "Content-Type": "application/json" } }
    );

    const vpJwt = response.data.signedComplianceCredentialJwt;

    console.log("\n✅ FINAL VP JWT:\n", vpJwt);

    // Save the signed VP JWT locally
    fs.mkdirSync(".well-known", { recursive: true });
    fs.writeFileSync(".well-known/participant-vp.jwt", vpJwt);

    console.log("\n📁 Saved to .well-known/participant-vp.jwt");

  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
}

main();
