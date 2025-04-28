import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'
import { createGenericFile, signerIdentity } from "@metaplex-foundation/umi";
import { readFileSync } from "fs"
import { KeypairSigner, Umi } from '@metaplex-foundation/umi';
import { Keypair } from "@solana/web3.js"
import { createSignerFromKeypair } from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair, fromWeb3JsPublicKey} from '@metaplex-foundation/umi-web3js-adapters';

interface uploadImageParameters {
    Umi : Umi,
    Filename : string,
    Type : "image/png" | "image/jpg" 
}

interface uploadMetadataParameters {
    Umi : Umi,
    TokenName : string,
    TokenSymbol : string,
    TokenDescription : string,
    TokenImageURL : string
}

interface initializeUMIParameters {
    RPCEndpoint : string,
    UserKeypair : Keypair
}


const devnetEndpoint = "https://api.devnet.solana.com";

export function initializeUMI({RPCEndpoint, UserKeypair} : initializeUMIParameters) : Umi {
    const NewUmi = createUmi(RPCEndpoint).use(irysUploader());
    const UserSigner = createSignerFromKeypair(NewUmi, fromWeb3JsKeypair(UserKeypair));
    NewUmi.use(signerIdentity(UserSigner, true))
    return NewUmi;
}

// const clientKeyPair = generateKeyPairFromSaveVanilla("ClientWallet.json")
// const ClientSigner = createSignerFromKeypair(umi, fromWeb3JsKeypair(clientKeyPair))
// const imageUri = imageUriRaw[0].replace("gateway", "devnet")
// console.log(imageUri);

export async function uploadImage({Umi, Filename, Type} : uploadImageParameters) : Promise<string> {    
    // Read Image File
    const imageFile = readFileSync(Filename)
    const umiImageFile = createGenericFile(imageFile, Filename, {
        tags: [{ name: "Content-Type", value: Type }],
    });

    // Upload File to Arweave via Irys [From Metaplex Documentation]
    console.log(`Uploading ${Filename} of type ${Type} to Arweave via Irys"`);
    let imageUriRaw = await Umi.uploader.upload([umiImageFile]).catch((err) => {
        throw new Error(err);   
    });

    // Return is a String[], only first Element Matters
    return imageUriRaw[0]
}

// metadataUri = metadataUri.replace("gateway", "devnet")
// console.log(metadataUri)

export async function uploadMetadata({Umi, TokenName, TokenSymbol, TokenDescription, TokenImageURL} : uploadMetadataParameters) : Promise<string> {
    const TokenMetadata = {
        name: TokenName,
        symbol: TokenSymbol,
        description: TokenDescription,
        image: TokenImageURL, // Either use variable or paste in string of the uri.
    };
    console.log("Uploading metadata to Arweave via Irys");
    let metadataUri = await Umi.uploader.uploadJson(TokenMetadata).catch((err) => {
        throw new Error(err);
    });
    
    return metadataUri;
}

