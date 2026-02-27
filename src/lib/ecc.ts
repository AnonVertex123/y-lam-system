import { base64ToBuffer, bufferToBase64 } from "./crypto";

function pemToArrayBuffer(pem: string) {
  const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----/g, "").replace(/-----END PUBLIC KEY-----/g, "").replace(/\s+/g, "");
  return base64ToBuffer(b64).buffer;
}

export async function importRecipientPublicKey(pem: string) {
  const spki = pemToArrayBuffer(pem);
  return crypto.subtle.importKey(
    "spki",
    spki,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
}

export async function eccEncrypt(data: string, recipientPem: string) {
  const recipient = await importRecipientPublicKey(recipientPem);
  const { privateKey: ephPriv, publicKey: ephPub } = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );
  const secret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: recipient },
    ephPriv,
    256
  );
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hkdfKey = await crypto.subtle.importKey("raw", secret, "HKDF", false, ["deriveKey"]);
  const aesKey = await crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt, info: new Uint8Array([]) },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, enc.encode(data));
  const epkSpki = await crypto.subtle.exportKey("spki", ephPub);
  return {
    alg: "P-256+HKDF-SHA256+AES-256-GCM",
    epkSpki: bufferToBase64(new Uint8Array(epkSpki)),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
    ciphertext: bufferToBase64(new Uint8Array(ct)),
  };
}
