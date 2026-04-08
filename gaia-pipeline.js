import axios from 'axios';
import fs from 'fs';
import path from 'path';

// --- Configuration ---
const LOCAL_BASE_URL = 'http://localhost:3000';
const PARTICIPANT_FILE = './participant.json';
const APPLICATION_FILE = './application.json';
const FINAL_VCID = 'https://lms-upatras.github.io/Gaia-X-LMS-IMXC/compliance.jwt';

async function runPipeline() {
    try {
        console.log('🚀 Starting Gaia-X Compliance Pipeline (ESM Mode)...\n');

        // 1. Load JSONs
        const participant = JSON.parse(fs.readFileSync(PARTICIPANT_FILE, 'utf8'));
        const application = JSON.parse(fs.readFileSync(APPLICATION_FILE, 'utf8'));

        // Fix: Ensure correct registration number field name for Gaia-X SHACL
        if (participant.credentialSubject['gx:registrationNumber']?.['gx:companyNumber']) {
            participant.credentialSubject['gx:registrationNumber']['gx:countryCompanyNumber'] = 
                participant.credentialSubject['gx:registrationNumber']['gx:companyNumber'];
            delete participant.credentialSubject['gx:registrationNumber']['gx:companyNumber'];
            console.log('✅ Auto-corrected gx:companyNumber to gx:countryCompanyNumber');
        }

        // 2. Package into a Verifiable Presentation (VP)
        console.log('📦 Wrapping credentials into a VP-JWT...');
        const vpPayload = {
            "@context": ["https://www.w3.org/ns/credentials/v2"],
            "type": ["VerifiablePresentation"],
            "verifiableCredential": [participant, application]
        };

        // Get signature from your local NestJS service
        const signResponse = await axios.post(`${LOCAL_BASE_URL}/validateFromJson`, vpPayload);
        const selfSignedJwt = signResponse.data.signedComplianceCredentialJwt;
        console.log('✅ VP-JWT generated and signed with your Local Key.');

        // 3. Request Official Compliance Signature
        console.log('⚖️ Requesting Compliance Signature from Local Service...');
        
        const complianceResponse = await axios.post(
            `${LOCAL_BASE_URL}/validateAndSignVcFromVp?vcid=${encodeURIComponent(FINAL_VCID)}`,
            selfSignedJwt,
            { headers: { 'Content-Type': 'application/vp+jwt' } }
        );

        const officialComplianceJwt = complianceResponse.data.signedComplianceCredentialJwt;
        console.log('🎉 SUCCESS! Official Gaia-X Compliance Label received.');

        // 4. Save the result
        fs.writeFileSync('./compliance-label.jwt', officialComplianceJwt);
        console.log('💾 Saved final token to: ./compliance-label.jwt');

        // 5. Final Verification Check (Optional)
        console.log('🔎 Performing final validity check against Lab...');
        const verifyResponse = await axios.post(
            `https://basic-functions.lab.gaia-x.eu/development/api/jwt/compliance-verification`,
            officialComplianceJwt,
            { headers: { 'Content-Type': 'application/vc+jwt' } }
        );

        if (verifyResponse.data.valid) {
            console.log('✅ Final Status: COMPLIANT');
        } else {
            console.log('❌ Final Status: INVALID', JSON.stringify(verifyResponse.data.errors, null, 2));
        }

    } catch (error) {
        console.error('\n❌ Pipeline Failed:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

runPipeline();