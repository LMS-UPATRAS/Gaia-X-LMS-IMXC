import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config(); // Load .env


async function main() {
  try {
    // 1. Load your Participant and Application credentials
    // Note: These should already be signed JWTs or valid Gaia-X JSON-LD
    const application = JSON.parse(fs.readFileSync('./application.json', 'utf8'));
    const participant = JSON.parse(fs.readFileSync('./participant.json', 'utf8'));

    // 2. Build the Verifiable Presentation (VP)
    const vp = {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://w3id.org/gaia-x/development#"
      ],
      "type": ["VerifiablePresentation"],
      // Use your REAL DID here
      "holder": "did:web:lms-upatras.github.io:Gaia-X-LMS-IMXC", 
      "verifiableCredential": [participant, application]
    };

    console.log("⏳ Sending VP to local compliance engine...");

    // 3. Send to your local compliance service (Port 3000)
    // This assumes your local tool has your private key configured!
    const response = await axios.post(
      `http://localhost:3000/validateFromJson`,
      vp,
      { headers: { "Content-Type": "application/json" } }
    );

    // 4. Extract the signed JWT
    const vpJwt = response.data.signedComplianceCredentialJwt;

    if (!vpJwt) {
        throw new Error("Compliance engine did not return a signed JWT. Check local logs.");
    }

    console.log("\n✅ SUCCESS! FINAL VP JWT GENERATED.");

    // 5. Save with the HM26 required naming convention
    const filename = "upatras.provider.battery.json"; // Using .json as discussed!
    fs.writeFileSync(filename, vpJwt);

    console.log(`\n📁 Saved as: ${filename}`);
    console.log("🚀 You are now ready to upload this file to Nextcloud.");

  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
}

main();