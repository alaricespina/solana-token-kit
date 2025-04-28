import { readFileSync } from "fs"
import { Keypair } from "@solana/web3.js";

export function readWalletData(filename : string) {
    try {
        const fileData = readFileSync(filename, "utf8");
        return JSON.parse(fileData);
    } catch (err) {
        console.error(err);
    }
}

export function generateKeyPairFromSaveVanilla(filename : string) {
    const data = readWalletData(filename);
    const retrievedSecret = Object.values(data.secretKey);
    const keyPairBytes = Uint8Array.from(retrievedSecret);
    return Keypair.fromSecretKey(keyPairBytes);
}
