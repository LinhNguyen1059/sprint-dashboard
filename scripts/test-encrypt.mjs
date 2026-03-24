import { createCipheriv, createHash, randomBytes } from "crypto";

const AES_PASSPHRASE = "i3 International Inc.";
const DOTNET_TICKS_OFFSET = BigInt("621355968000000000");

function deriveKeyAndIV(passphrase, salt) {
  const pass = Buffer.from(passphrase, "ascii");
  let hashList = Buffer.alloc(0);
  let currentHash = Buffer.alloc(0);

  const computeHash = (input) => createHash("sha1").update(input).digest();

  currentHash = computeHash(Buffer.concat([pass, salt]));
  hashList = Buffer.concat([hashList, currentHash]);

  while (hashList.length < 48) {
    currentHash = computeHash(Buffer.concat([currentHash, pass, salt]));
    hashList = Buffer.concat([hashList, currentHash]);
  }

  return { key: hashList.subarray(0, 32), iv: hashList.subarray(32, 48) };
}

function generateSecretKey() {
  const expiryMs = Date.now() + 600_000;
  const ticks = (
    BigInt(expiryMs) * BigInt(10_000) +
    DOTNET_TICKS_OFFSET
  ).toString();

  console.log("Ticks to encrypt:", ticks);

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
}

const result = generateSecretKey();
console.log("Encrypted (Base64):", result);
