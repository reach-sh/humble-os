import { generateKey, randomBytes } from "crypto";

/**
 * Generate ENV encryption keys. Modify as needed
 */
generateKey("aes", { length: 256 }, (err, key) => {
  if (err) return console.error(err);
  const JWT_SEC = randomBytes(32).toString("hex");
  const ENCRYPT = key.export().toString("hex");

  console.clear();
  console.log("Move these values to your .env file");
  console.log();
  console.log(`
JWT_SEC="${JWT_SEC}"
ENCRYPT="${ENCRYPT}"
  `);
  console.log();
  console.log("Kill the terminal process when done [ Ctrl + c ]");
});
