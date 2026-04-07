import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    // 1. Load the CLEAN files we just created
    const application = JSON.parse(fs.readFileSync('./application.json', 'utf8'));
    const participant = JSON.parse(fs.readFileSync('./participant.json', 'utf8'));

    // 2. Build the Verifiable Presentation (VP)
    // IMPORTANT: The @context must include the W3C Credentials v2 for IMXC
    const vp = {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://w3id.org/gaia-x/development#",
        "http://w3id.org/imx"
      ],
      "type": ["VerifiablePresentation"],
      "holder": "did:web:lms-upatras.github.io:Gaia-X-LMS-IMXC", 
      "verifiableCredential": [participant, application]
    };

    console.log("⏳ Sending VP to local compliance engine at http://localhost:3000/validateFromJson...");

    // 3. Request the signature
    // Note: If 'validateFromJson' gives a 404, try 'validateAndSignVcFromVp' 
    // or wait for the IMX team to provide their official endpoint.
    const response = await axios.post(
      `http://localhost:3000/validateFromJson`, 
      vp,
      { headers: { "Content-Type": "application/json" } }
    );

    // 4. Extract the signed JWT 
    // The key name might vary (signedComplianceCredentialJwt or just jwt) depending on your tool version
    const vpJwt = response.data.signedComplianceCredentialJwt || response.data.jwt;

    if (!vpJwt) {
        console.error("DEBUG: Received response structure:", response.data);
        throw new Error("Compliance engine did not return a signed JWT.");
    }

    // 5. Save the final "Passport"
    const filename = "upatras.provider.battery.json"; 
    fs.writeFileSync(filename, vpJwt);

    console.log("\n✅ SUCCESS! FINAL VP JWT GENERATED.");
    console.log(`📁 Saved as: ${filename}`);
    console.log("🚀 Upload this file to: https://nextcloud.truzzt.eu/s/8yAyyAWA7JRz9Am");

  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
        console.error("❌ Error: Local server on port 3000 is not running. Start your Docker container/service first!");
    } else {
        console.error("❌ Error:", err.response?.data || err.message);
    }
  }
}

main();