import {
    createSolanaClient,
    createTransaction,
    generateKeyPairSigner,
    getExplorerLink,
    getMinimumBalanceForRentExemption,
    getSignatureFromTransaction,
    signTransactionMessageWithSigners,
    createKeyPairSignerFromBytes,
    createKeypairFromBase58,
    Address
} from "gill";
import { loadKeypairSignerFromFile } from "gill/node";
import {
    getCreateAccountInstruction,
    getCreateMetadataAccountV3Instruction,
    getTokenMetadataAddress,
} from "gill/programs";
import {
    getCreateTokenInstructions,
    getInitializeMintInstruction,
    getMintSize,
    TOKEN_PROGRAM_ADDRESS,
    getAssociatedTokenAccountAddress,
    getCreateAssociatedTokenIdempotentInstruction,
    getMintToInstruction,
    getTransferCheckedInstruction,
    getTransferInstruction,
    getSetAuthorityInstruction,
    AuthorityType,
    
} from "gill/programs/token";
import { readFileSync } from "fs";

import { Keypair } from "@solana/web3.js";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair, fromWeb3JsPublicKey} from '@metaplex-foundation/umi-web3js-adapters';

const { rpc, sendAndConfirmTransaction } = createSolanaClient({
    urlOrMoniker: "devnet",
});

function readWalletData(filename : string) {
    try {
        const fileData = readFileSync(filename, "utf8");
        return JSON.parse(fileData);
    } catch (err) {
        console.error(err);
    }
}

async function generateKeyPairFromSave(filename : string) {
    const data = readWalletData(filename);
    const retrievedSecret = Object.values(data.secretKey);
    const keyPairBytes = Uint8Array.from(retrievedSecret);
    return await createKeyPairSignerFromBytes(keyPairBytes);
}

function generateKeyPairFromSaveVanilla(filename : string) {
    const data = readWalletData(filename);
    const retrievedSecret = Object.values(data.secretKey);
    const keyPairBytes = Uint8Array.from(retrievedSecret);
    return Keypair.fromSecretKey(keyPairBytes);
}

const signer = await generateKeyPairFromSave("ClientWallet.json")
console.log("Signer", signer.address);

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const tokenProgram = TOKEN_PROGRAM_ADDRESS;
const mint = await generateKeyPairSigner();
console.log("mint:", mint.address);
const owner = signer.address;
const ata = await getAssociatedTokenAccountAddress(mint, owner, TOKEN_PROGRAM_ADDRESS);
const clientAddress = "H3Z4PiFmX8EWxUrFoUoCtkubkSLXnZTPUSpPdqZn6Ecy" as Address;
const clientATA = await getAssociatedTokenAccountAddress(mint, clientAddress, TOKEN_PROGRAM_ADDRESS);

const space = getMintSize();

const metadataAddress = await getTokenMetadataAddress(mint);

const umi = createUmi("https://api.devnet.solana.com").use(irysUploader());
const clientKeyPair = generateKeyPairFromSaveVanilla("ClientWallet.json")
const ClientSigner = createSignerFromKeypair(umi, fromWeb3JsKeypair(clientKeyPair))
umi.use(signerIdentity(ClientSigner, true))
const imageFile = readFileSync("mp.png")
const umiImageFile = createGenericFile(imageFile, "mp.png", {
    tags: [{ name: "Content-Type", value: "image/png" }],
});
console.log("Uploading image to Arweave via Irys");
let imageUriRaw = await umi.uploader.upload([umiImageFile]).catch((err) => {
    throw new Error(err);   
});
const imageUri = imageUriRaw[0].replace("gateway", "devnet")
console.log(imageUri);
const metadata = {
    name: "HATDOG TOKEN",
    symbol: "HAT",
    description: "Hehe",
    image: imageUri, // Either use variable or paste in string of the uri.
};
console.log("Uploading metadata to Arweave via Irys");
let metadataUri = await umi.uploader.uploadJson(metadata).catch((err) => {
    throw new Error(err);
});

metadataUri = metadataUri.replace("gateway", "devnet")
console.log(metadataUri)

const tx = createTransaction({
    feePayer: signer,
    version: "legacy",
    instructions: [
        getCreateAccountInstruction({
            space,
            lamports: getMinimumBalanceForRentExemption(space),
            newAccount: mint,
            payer: signer,
            programAddress: tokenProgram,
        }),
        getInitializeMintInstruction(
            {
            mint: mint.address,
            mintAuthority: signer.address,
            freezeAuthority: null,
            decimals: 9,
            },
            {
            programAddress: tokenProgram,
            },
        ),
        getCreateMetadataAccountV3Instruction({
            collectionDetails: null,
            isMutable: false,
            updateAuthority: signer,
            mint: mint.address,
            metadata: metadataAddress,
            mintAuthority: signer,
            payer: signer,
            data: {
                sellerFeeBasisPoints: 0,
                collection: null,
                creators: null,
                uses: null,
                name: "HATDOG TOKEN",
                symbol: "HAT",
                // uri: "https://devnet.irys.xyz/7FmYmngLjauLKxr2vNUvwYGmTCQUepSrHgNTd8Ve99AR",
                uri : metadataUri
            },
        }),
        getCreateAssociatedTokenIdempotentInstruction({
            payer : signer,
            ata : clientATA,
            owner : clientAddress,
            mint : mint.address,
            tokenProgram : TOKEN_PROGRAM_ADDRESS
        }),
        getMintToInstruction(
            {
                mint : mint.address,
                mintAuthority: signer,
                token: clientATA,
                amount: 169_000_000_000,
            },
            {
                programAddress: TOKEN_PROGRAM_ADDRESS,
            },
        ),
        getSetAuthorityInstruction(
            {
                owned : mint.address,
                owner : signer,
                authorityType : AuthorityType.MintTokens,
                newAuthority : null
            },
            {
                programAddress: TOKEN_PROGRAM_ADDRESS
            }
        )
    ],
    latestBlockhash,
    });

const signedTransaction = await signTransactionMessageWithSigners(tx);

console.log(
    "Explorer:",
    getExplorerLink({
        cluster: "devnet",
        transaction: getSignatureFromTransaction(signedTransaction),
    }),
);

await sendAndConfirmTransaction(signedTransaction);