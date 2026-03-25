# Gaia-X IMXC Compliance Repo

This repository contains Gaia-X compliance artifacts for the IMXC Battery Use Case.

## Files

- application.json → Application Credential
- participant.json → Participant Credential
- vp.json → Verifiable Presentation (generated dynamically)
- sign-vp.js → Script to generate VC
- .well-known/compliance-vc.jwt → Final VC

## How to run

1. Start Gaia-X compliance service (port 3000)

2. Install dependencies:
   npm install

3. Run:
   node sign-vp.js

## Output

- Final VC JWT stored in:
  .well-known/compliance-vc.jwt
