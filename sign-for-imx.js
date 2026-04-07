// sign-at-lab.js
import axios from 'axios';
import fs from 'fs';

async function signAtLab() {
  // 1. Load the JWT you generated locally (upatras.provider.battery.json)
  // This file must be a raw string starting with 'eyJ...'
  const localJwt = fs.readFileSync('./upatras.provider.battery.json', 'utf8').trim();

  // 2. Define your GitHub target URL (where the signed file will live)
  const vcid = "https://lms-upatras.github.io/Gaia-X-LMS-IMXC/upatras.provider.battery.json";

  // 3. Call the Official Lab Extension
  const labUrl = `https://imx-extension.lab.gaia-x.eu/development/validateAndSignVcFromVp?vcid=${encodeURIComponent(vcid)}`;

  console.log("🚀 Sending JWT to Gaia-X Lab for Official IMX Validation...");

  try {
    const response = await axios.post(labUrl, localJwt, {
      headers: {
        'Content-Type': 'text/plain', // Crucial: Send as plain text string
        'Accept': 'application/vc+jwt'
      }
    });

    // 4. Save the Official Response
    const officialJwt = response.data.signedComplianceCredentialJwt || response.data;
    fs.writeFileSync('upatras.provider.battery.json', officialJwt);

    console.log("✅ SUCCESS! Your Battery Passport is now officially Gaia-X/IMX compliant.");
    console.log("📁 File updated: upatras.provider.battery.json");

  } catch (err) {
    console.error("❌ Lab Validation Failed.");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Detail:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Error:", err.message);
    }
  }
}

signAtLab();