import forge from 'node-forge';

// 1. YOUR PRIVATE KEY (Paste your generated JWK here)
const jwk = {
  "kty": "RSA",
  "n": "wdeI6vy51TgzAIfVsX5nwlHF285DnWRZL9GiFoggB6rnsD7GgHyK-BlQ9t86t4rYh4_h3YcySb49oK3NLXt--cj2bSbywJXFEkeWh265HLLyHc9ChnneSVF2oeN9-t-Ng1NMv_rOGn-N29Z4w6XBSHRFpUnsuXWXK6cm23Yw_uQaGHT1bs9pt04SzIgc-4I1AZpmA1y75MX1EVQhonwZF_QFQU3R7wXdaYoO86wVdqA8s_kdVLU7-yM3hji4VX9nvzQniUSCT9gQTFdKf3DvgFzPZPein3ZKqEyHefDeIiiuBVm1W_Lq5Zewtsa9I2uGafGv_0YE4FX8GMEYby1LbQ",
  "e": "AQAB",
  "d": "FBMBH-zKRfWK-pwWmkoP7sTPK8NBp1QUFGquUY0JXCHr2om1vuqm7aiZhOd7SjS71dYluu5cW9yyvyggnnwymyWft5AYBa-89_an9SCXVQyHHGUxa4HFbmxcT8mia0-pdRc0VJFhtMbO5xxf50sMKDe6WrK8LDysSh4GXSXxTwQbyX9jLkOO0cs0dA668HHvtjv92C8auZdoaR7yqKdtMi6aR8fEYJ8r8KFgyJheeuHV6dUAkvdNGhL3WXqCytHxw6pocAKJ25ckguy8sflQlkKEFJCeHfs0zZpb-1eIjVwljIATZVzNW6SrI7v2JBr-nWO4wVSskYeKZpbPuU-fYQ",
  "p": "_2Wx2Kuv2ukbDALeqpCwVR6JTqOlC0R1M-uL2pKpUrUB1rZVFBmyNVz64ZPwQKtF5hF49BFOUTYWOpxBu9fUqv-ABP0grREuEIudv-xAgSNtn-AY5KYvIuB25Dh8T7-FkHN7D1ocSGoDscLxVhmAM7ihtNDFo0bTnXFQgbQdGwU",
  "q": "wkymWEIr2eQc_Twh9bYJWoFsSxSLj9wYZudEpV_vhcnQVIyhJtQsq9284JQoWLBVhKCBM7ZzP6lTF4bhvXzFiJkSnhmDJ4FjpiEpztHgyOezAr5KQPMnvlMzYrEVqKRRTlqgE4bxH8TdjnVuz6GoiG2OXPxH9QlEXLARyek360k",
  "dp": "Xn6J5tjfH-fPkgodyI3wMA40T1xM3HZfxu4HuL861tcR7xdXMzCutv_H816BLeww2IbucZ9VksaoQtc9mvqoPPx7qVzekiohGQ4PN8t5sk4haV3I2BCEsCrM0nPzyq3aBTA0_-EfRcuzwjmWgXy96mUNr5DvDxJNiZs7ZkH14uE",
  "dq": "pyR64GekA1-JVIq7B_0dlL7LItc8q3eBglwmIEEj8ipGzcTgCF_zQbGQ_nxVLN4b4uiT3KFyCOynLxD39iJ0ZuqPKnP18DENQOc8aM8BGLLAunZpt--0W7SE-rwtTpJz4vxwwfuOR275zMfWmESPjzT3h6P6Xp8nMLjBxLicQwk",
  "qi": "_CH0FrNDFdCKPDA8MQp8hJMa6iG3ayeUb5wWzXYLk27oUHuBKQe3mp8RuKtTH6sRw7ZqLo5sbRXRUlvNEMtzHyVABbXO-HCS2Ztq5CJyTSkA_BI9dsF6QiEO2YJVjEQKcf7fG4p0-jUb5RHxy8Z6AMJAdMrKssh5kq6cL6vinew"
};

async function createCert() {
  // Helper to convert Base64URL (JWK) to Hex (Forge)
  const base64UrlToHex = (base64url) => {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    return forge.util.bytesToHex(forge.util.decode64(base64));
  };

  // 2. Convert JWK components to Forge BigIntegers correctly
  const privateKey = forge.pki.setRsaPrivateKey(
    new forge.jsbn.BigInteger(base64UrlToHex(jwk.n), 16),
    new forge.jsbn.BigInteger(base64UrlToHex(jwk.e), 16),
    new forge.jsbn.BigInteger(base64UrlToHex(jwk.d), 16),
    new forge.jsbn.BigInteger(base64UrlToHex(jwk.p), 16),
    new forge.jsbn.BigInteger(base64UrlToHex(jwk.q), 16),
    new forge.jsbn.BigInteger(base64UrlToHex(jwk.dp), 16),
    new forge.jsbn.BigInteger(base64UrlToHex(jwk.dq), 16),
    new forge.jsbn.BigInteger(base64UrlToHex(jwk.qi), 16)
  );

  const publicKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);

  // 3. Create Certificate (Everything else stays the same)
  const cert = forge.pki.createCertificate();
  cert.publicKey = publicKey;
  cert.serialNumber = '01' + Date.now(); // Unique serial
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs = [
    { name: 'commonName', value: 'lms-upatras.github.io' },
    { name: 'organizationName', value: 'University of Patras' }
  ];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  // 4. Sign (This should be instant now)
  cert.sign(privateKey, forge.md.sha256.create());

  const base64 = forge.pki.certificateToPem(cert)
    .replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\s+/g, '');

  console.log("--- COPY THIS INTO YOUR x5c ARRAY ---");
  console.log(base64);
}

createCert();