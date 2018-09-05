import bcrypt from "bcrypt";
import fs from "fs";
import util from "util";
import url from "url";

// convert callback based functions into promise based functions
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// check a password against the hash in the file
export async function verifyPassword(req) {
    const password = url.parse(req.url, true).query.password;
    const passwordHash = await readFile("./password_hash.txt", "uft8");

    return bcrypt.compare(password, passwordHash);
}

// create a hash of a the password and save it to a file
export let hashPassword = async(req) => {
    const password = url.parse(req.url, true).query.password;

    if(password === "password") {
        throw new Error("Weak password used");
    }

    const passwordHash = await bcrypt.hash(password);

    await writeFile("./password_hash.txt", passwordHash);
};
