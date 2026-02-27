import { decryptString, encryptString } from "./crypto";

const STORAGE_KEY = "yl.api.enc.v1";

type StoredPayload = {
  iv: string;
  salt: string;
  ciphertext: string;
};

export async function saveApiKeyEncrypted(apiKey: string, passphrase: string) {
  const payload = await encryptString(apiKey, passphrase);
  const json: StoredPayload = {
    iv: payload.iv,
    salt: payload.salt,
    ciphertext: payload.ciphertext,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
}

export function hasEncryptedApiKey(): boolean {
  return typeof localStorage !== "undefined" && !!localStorage.getItem(STORAGE_KEY);
}

export async function loadApiKey(passphrase: string): Promise<string | null> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const { iv, salt, ciphertext } = JSON.parse(raw) as StoredPayload;
    return await decryptString(ciphertext, passphrase, iv, salt);
  } catch {
    return null;
  }
}

export function clearApiKey() {
  localStorage.removeItem(STORAGE_KEY);
}
