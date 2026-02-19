import { deployFunction, deploySite, getOrCreateBucket } from '@remotion/lambda';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { VERSION } from 'remotion/version';

dotenv.config({ path: '.env.local' });

// AWS Credentials are read from process.env (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)

async function main() {
    console.log('Starting Remotion Lambda deployment...');

    const region = (process.env.REMOTION_AWS_REGION || 'us-east-1') as any;

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
        timeoutInSeconds: 900,
    } as any);
    console.log(`Function deployed: ${functionName} (Existed: ${alreadyExisted})`);

    // 3. Deploy Site (The Remotion Project)
    const { serveUrl, siteName } = await deploySite({
        bucketName,
        entryPoint: path.join(process.cwd(), 'remotion', 'root.tsx'),
        region,
        siteName: 'vediomax',
    });
    console.log(`Site deployed: ${siteName}`);
    console.log(`Serve URL: ${serveUrl}`);

    console.log('----------------------------------------------------------------');
    console.log('Deployment Complete!');
    console.log(`Region: ${region}`);
    console.log(`Bucket: ${bucketName}`);
    console.log(`Function: ${functionName}`);
    console.log(`Serve URL: ${serveUrl}`);

    // Auto-update .env.local with the new values
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf-8');

    // Update REMOTION_SERVE_URL
    envContent = envContent.replace(
        /^REMOTION_SERVE_URL=.*/m,
        `REMOTION_SERVE_URL=${serveUrl}`
    );
    // Update REMOTION_FUNCTION_NAME
    envContent = envContent.replace(
        /^REMOTION_FUNCTION_NAME=.*/m,
        `REMOTION_FUNCTION_NAME=${functionName}`
    );

    fs.writeFileSync(envPath, envContent);
    console.log('\n.env.local updated automatically!');
}

main().catch((err) => {
    console.error('Deployment failed:', err);
    process.exit(1);
});
