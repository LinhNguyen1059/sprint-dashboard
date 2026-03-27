/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createCipheriv, createHash, randomBytes } from "crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const AES_PASSPHRASE = "i3 International Inc.";
// .NET DateTime ticks offset: number of 100ns intervals from 0001-01-01 to Unix epoch (1970-01-01)
const DOTNET_TICKS_OFFSET = BigInt("621355968000000000");

/**
 * Replicates .NET AESUtility.DeriveKeyAndIV — SHA1-based, 1 iteration.
 * preHash[0] = passphrase + salt
 * preHash[n] = prevHash + passphrase + salt
 */
function deriveKeyAndIV(
  passphrase: string,
  salt: Buffer,
): { key: Buffer; iv: Buffer } {
  const pass = Buffer.from(passphrase, "ascii");
  let hashList = Buffer.alloc(0);
  let currentHash = Buffer.alloc(0);

  const computeHash = (input: Buffer) =>
    createHash("sha1").update(input).digest();

  // @ts-ignore
  currentHash = computeHash(Buffer.concat([pass, salt]));
  hashList = Buffer.concat([hashList, currentHash]);

  while (hashList.length < 48) {
    // @ts-ignore
    currentHash = computeHash(Buffer.concat([currentHash, pass, salt]));
    hashList = Buffer.concat([hashList, currentHash]);
  }

  return { key: hashList.subarray(0, 32), iv: hashList.subarray(32, 48) };
}

/**
 * Replicates .NET AESUtility.GetEncryptedSecretKey().
 * Encrypts (UTC now + 10 min) as .NET ticks string using AES-256-CBC.
 * Output is Base64-encoded: "Salted__" + 8-byte salt + ciphertext.
 */
export function generateSecretKey(): string {
  try {
    const expiryMs = Date.now() + 600_000;
    const ticks = (
      BigInt(expiryMs) * BigInt(10_000) +
      DOTNET_TICKS_OFFSET
    ).toString();

    const salt = randomBytes(8);
    const { key, iv } = deriveKeyAndIV(AES_PASSPHRASE, salt);

    const cipher = createCipheriv("aes-256-cbc", key, iv);
    const encrypted = Buffer.concat([
      cipher.update(ticks, "utf8"),
      cipher.final(),
    ]);

    return Buffer.concat([Buffer.from("Salted__"), salt, encrypted]).toString(
      "base64",
    );
  } catch (error) {
    console.error("generateSecretKey error:", error);
    return "";
  }
}

/**
 * Read the Redmine API key from the `access_token` cookie.
 * Returns `{ apiKey }` on success or `{ error: NextResponse }` when missing.
 */
export async function getApiKey(): Promise<
  { apiKey: string; error?: never } | { apiKey?: never; error: NextResponse }
> {
  const cookieStore = await cookies();
  const apiKey = cookieStore.get("access_token")?.value;

  if (!apiKey) {
    return {
      error: NextResponse.json(
        { valid: false, error: "Missing API key" },
        { status: 400 },
      ),
    };
  }

  return { apiKey };
}

/**
 * Wrapper around fetch for Redmine API calls.
 * Automatically injects the required headers.
 */
export async function redmineFetch({
  path,
  apiKey,
  options,
  useCustomApi = false,
}: {
  path: string;
  apiKey: string;
  options?: RequestInit;
  useCustomApi?: boolean;
}): Promise<Response> {
  const url = `${useCustomApi ? process.env.NEXT_PUBLIC_CUSTOM_API_URL : process.env.NEXT_PUBLIC_API_URL}${path}`;
  return fetch(url, {
    ...options,
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": apiKey,
      ...options?.headers,
    },
  });
}
