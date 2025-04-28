import { Storage } from "@google-cloud/storage";

// TO DO: Put into a .env file
const GCP_ProjectId = "brave-drive-456915-j1";
const GCP_keyFilename = "service-account.json"; 
const GCP_BucketLink = "gs://devnet-storage";

const storage = new Storage({
  projectId: GCP_ProjectId,
  keyFilename: GCP_keyFilename,
});

const bucket = storage.bucket(GCP_BucketLink);

export async function uploadImageToFirebase(ImageFilePath : string, CloudFileName : string) {
    try {
        const storagepath = `${CloudFileName}`;
        const result = await bucket.upload(ImageFilePath, {
            destination: storagepath,
            // Only Need to set to public true if bucket is not yet public
            // Implemented Bucket was already made public so no need for this snippet
            // public: true,

            // Default Metadata type is fine for Images
            // metadata: {
            //     contentType: "application/plain", //application/csv for excel or csv file upload
            // }
        });

        // Download Link
        // console.log(result[0].metadata.mediaLink)
        // return result[0].metadata.mediaLink;

        // Browser Viewing Link (Public as per Storage Bucket Settings)
        return `https://storage.googleapis.com/devnet-storage/${CloudFileName}`
        
    } catch (error) {
        // Web App Mode - Shouldnt Break Execution
        // throw new Error(error.message);
        console.log(error);
    }
}

export async function uploadJsonToFirebase(JSONObject : object, CloudFileName : string) {
    // Create a New File + CurrentTime for Unique Name
    // const timestamp = new Date().getTime()
    // const fileName = `${fileName}${timestamp}.json`

    // Create a New File 
    const file = bucket.file(CloudFileName)
    const contents = JSON.stringify(JSONObject)
    await file.save(contents)
    return `https://storage.googleapis.com/devnet-storage/${CloudFileName}`
}

// const uploadfilepath = "mp.png"
// let result= await uploadToFirebaseStorage(`${uploadfilepath}`, 'mp.png');
// // console.log(result);

// const metadata = {
//     name: "HATDOG TOKEN TESTNET",
//     symbol: "TESTHAT",
//     description: "Hehe",
//     // image: imageUri, // Either use variable or paste in string of the uri.
//     image: result
//     // image: "https://raw.githubusercontent.com/slrpmas/HatdogTest/refs/heads/main/mp.png"
// };


// const res = await saveJsonFile(metadata, "mp.json")
// console.log(res)

