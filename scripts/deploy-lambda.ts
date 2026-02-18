import { deployFunction, deploySite, getOrCreateBucket } from '@remotion/lambda';
import path from 'path';
import dotenv from 'dotenv';
import { VERSION } from 'remotion/version';

dotenv.config({ path: '.env.local' });

// AWS Credentials are read from process.env (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)

async function main() {
    console.log('Starting Remotion Lambda deployment...');

    const region = process.env.REMOTION_AWS_REGION || 'us-east-1';

    // 1. Get or Create Bucket
    const { bucketName } = await getOrCreateBucket({
        region,
    });
    console.log(`Bucket ensured: ${bucketName}`);

    // 2. Deploy Function
    const { functionName, alreadyExisted } = await deployFunction({
        createCloudWatchLogGroup: true,
        memorySizeInMb: 2048,
        region,
        timeoutInSeconds: 240,
        version: VERSION,
    });
    console.log(`Function deployed: ${functionName} (Existed: ${alreadyExisted})`);

    // 3. Deploy Site (The Remotion Project)
    const { serveUrl, siteName } = await deploySite({
        bucketName,
        entryPoint: path.join(process.cwd(), 'remotion', 'root.tsx'),
        region,
        siteName: 'vediomax-render',
    });
    console.log(`Site deployed: ${siteName}`);
    console.log(`Serve URL: ${serveUrl}`);

    console.log('----------------------------------------------------------------');
    console.log('Deployment Complete!');
    console.log(`Region: ${region}`);
    console.log(`Bucket: ${bucketName}`);
    console.log(`Function: ${functionName}`);
    console.log(`Serve URL: ${serveUrl}`);

    // Save these to .env.local or just output them for the user to copy
    // For automation, we might want to append them, but for now console is fine.
}

main().catch((err) => {
    console.error('Deployment failed:', err);
    process.exit(1);
});
