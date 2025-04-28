import {
    createSolanaClient,
    createTransaction,
    generateKeyPairSigner,
    getExplorerLink,
    getMinimumBalanceForRentExemption,
    getSignatureFromTransaction,
    signTransactionMessageWithSigners,
    createKeyPairSignerFromBytes,
    Address
} from "gill";
import {
    getCreateAccountInstruction,
    getCreateMetadataAccountV3Instruction,
    getTokenMetadataAddress,
} from "gill/programs";
import {
    getInitializeMintInstruction,
    getMintSize,
    TOKEN_PROGRAM_ADDRESS,
    getAssociatedTokenAccountAddress,
    getCreateAssociatedTokenIdempotentInstruction,
    getMintToInstruction,
    getSetAuthorityInstruction,
    AuthorityType,
    
} from "gill/programs/token";
import { readFileSync } from "fs";
import { Keypair } from "@solana/web3.js";
import { uploadMetadata as uploadMetadataGCP, uploadImage as uploadImageGCP } from "./uploadGCP";
import { initializeUMI, uploadImage as uploadImageArweave, uploadMetadata as uploadMetadataArweave} from "./uploadArweave";

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

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

// Would be replaced by the Wallet Adapter to just get Signer
const signer = await generateKeyPairFromSave("ClientWallet.json")
console.log("Signer", signer.address);

// Uses old Tokenkeg standard instead of Token2022
const tokenProgram = TOKEN_PROGRAM_ADDRESS;

// Generate the new Token Mint 
// Can be replaced in the future with Vanity Grinded Address
const mint = await generateKeyPairSigner();
console.log("mint:", mint.address);

// Can be replaced by the Protocol (This) Address to renounce ownership of maker
// Currently not used
// If Used Transaction would have still have to Make ATA of Client 
// Then Transfer from Owner (This) Address to Client
// Which is more steps = more expensive
const owner = signer.address;
const ata = await getAssociatedTokenAccountAddress(mint, owner, TOKEN_PROGRAM_ADDRESS);

// Client Address will be replaced by Wallet Adapter Public Key Address
// Currently the one used to directly send to the user the new Token
const clientAddress = "H3Z4PiFmX8EWxUrFoUoCtkubkSLXnZTPUSpPdqZn6Ecy" as Address;
const clientATA = await getAssociatedTokenAccountAddress(mint, clientAddress, TOKEN_PROGRAM_ADDRESS);

// Calculate the Mint Size for Holding All Data and the Metadata Address
// Specify the Metadata as well
// Image FileType and FileName should be replaced by open dialog box
// Limit the FileType to supported image formats
const space = getMintSize();
const metadataAddress = await getTokenMetadataAddress(mint);
const tokenMetadata = {
    Name : "HATDOG TOKEN",
    Symbol : "HEHE",
    Description : "HEHE Description",
    ImageFileName : "mp.png", 
    ImageFileType : "image/png" // For Arweave
}

// Legacy Metadata uploading using Arweave

// const umi = createUmi("https://api.devnet.solana.com").use(irysUploader());
// const clientKeyPair = generateKeyPairFromSaveVanilla("ClientWallet.json")
// const ClientSigner = createSignerFromKeypair(umi, fromWeb3JsKeypair(clientKeyPair))
// umi.use(signerIdentity(ClientSigner, true))
// const imageFile = readFileSync("mp.png")
// const umiImageFile = createGenericFile(imageFile, "mp.png", {
//     tags: [{ name: "Content-Type", value: "image/png" }],
// });
// console.log("Uploading image to Arweave via Irys");
// let imageUriRaw = await umi.uploader.upload([umiImageFile]).catch((err) => {
//     throw new Error(err);   
// });
// const imageUri = imageUriRaw[0].replace("gateway", "devnet")
// console.log(imageUri);
// const metadata = {
//     name: "HATDOG TOKEN",
//     symbol: "HAT",
//     description: "Hehe",
//     image: imageUri, // Either use variable or paste in string of the uri.
// };
// console.log("Uploading metadata to Arweave via Irys");
// let metadataUri = await umi.uploader.uploadJson(metadata).catch((err) => {
//     throw new Error(err);
// });

// metadataUri = metadataUri.replace("gateway", "devnet")
// console.log(metadataUri)

// New Metadata Upload using Arweave

const clientKeyPair = generateKeyPairFromSaveVanilla("ClientWallet.json")
const devnetEndpoint = "https://api.devnet.solana.com";
const ArweaveUMI = initializeUMI({
    RPCEndpoint : devnetEndpoint,
    UserKeypair : clientKeyPair
});
const imageUri = await uploadImageArweave({
    Umi : ArweaveUMI, 
    Filename : tokenMetadata.ImageFileName,
    Type : tokenMetadata.ImageFileType
});
const metadataUri = await uploadMetadataArweave({
    Umi : ArweaveUMI,
    TokenName : tokenMetadata.Name,
    TokenSymbol : tokenMetadata.Symbol,
    TokenDescription : tokenMetadata.Description,
    TokenImageURL : imageUri
});

// New Metadata Upload using Google Cloud Platform 

// const imageUri = await uploadImageGCP({
//     ImageFilePath : "mp.png",
//     CloudFileName : "mp.png"
// })

// const metadataUri = await uploadMetadata({
//     TokenName : tokenMetadata.Name,
//     TokenSymbol : tokenMetadata.Symbol,
//     TokenDescription : tokenMetadata.Description,
//     TokenImageURL : imageUri,
//     CloudFileName : `${new Date().getTime()}.json`
// })

// Create Transaction [Gill]
// Issues with old Solana/Web3.js Library Transactions:
// - Metadata is only seen on raw.github
// - Metadata is not in sync (sometimes there is no image or no name)
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
            tokenProgram : tokenProgram
        }),
        getMintToInstruction(
            {
                mint : mint.address,
                mintAuthority: signer,
                token: clientATA,
                amount: 169_000_000_000,
            },
            {
                programAddress: tokenProgram,
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