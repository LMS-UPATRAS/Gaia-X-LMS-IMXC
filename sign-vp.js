import axios from 'axios';
import fs from 'fs';

async function main() {
  const application = JSON.parse(fs.readFileSync('./application.json', 'utf8'));
  const participant = JSON.parse(fs.readFileSync('./participant.json', 'utf8'));

  // Build VP dynamically
  const vp = {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://w3id.org/gaia-x/development#"
    ],
    "type": ["VerifiablePresentation"],
    "holder": participant.credentialSubject.id,
    "verifiableCredential": [participant, application]
  };

  const vcid = "https://lms-upatras.github.io/Gaia-X-LMS-IMXC/.well-known/compliance-vc.jwt";

  try {
    const response = await axios.post(
      "http://localhost:3000/validateFromJson?vcid=" + encodeURIComponent(vcid),
      vp,
      { headers: { "Content-Type": "application/json" } }
    );

    const vcJwt = response.data.signedComplianceCredentialJwt;

    console.log("\n✅ FINAL VC JWT:\n", vcJwt);

    // Save outputs
    fs.mkdirSync(".well-known", { recursive: true });

    fs.writeFileSync(".well-known/compliance-vc.jwt", vcJwt);

    console.log("\n📁 Saved to .well-known/compliance-vc.jwt");

  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
}

main();
