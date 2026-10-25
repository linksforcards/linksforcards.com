import bcrypt from "bcryptjs";
import { createInterface } from "node:readline";
import { readFileSync } from "node:fs";
import { Writable } from "node:stream";

function emit(hash) {
  process.stdout.write(`${hash}\n`);
  process.stderr.write(`For a local .env file: ADMIN_PASSWORD_HASH=${hash.replaceAll("$", "\\$")}\n`);
}

if (!process.stdin.isTTY) {
  const password = readFileSync(0, "utf8").replace(/\r?\n$/, "");
  if (password.length < 10) {
    console.error("Use at least 10 characters.");
    process.exit(1);
  }
  emit(bcrypt.hashSync(password, 12));
  process.exit(0);
}

let muted = false;
const output = new Writable({
  write(chunk, _encoding, callback) {
    if (!muted) process.stdout.write(chunk);
    callback();
  },
});

const rl = createInterface({ input: process.stdin, output, terminal: true });
process.stdout.write("Password (hidden, at least 10 characters): ");
muted = true;
rl.question("", (password) => {
  muted = false;
  process.stdout.write("\n");
  rl.close();
  if (password.length < 10) {
    console.error("Use at least 10 characters.");
    process.exit(1);
  }
  emit(bcrypt.hashSync(password, 12));
});
