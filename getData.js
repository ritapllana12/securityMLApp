import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import AWS from 'aws-sdk';
AWS.config.update({ region: 'eu-north-1' });
const s3 = new S3Client({ region: 'eu-north-1' });

// Helper function to convert stream to string
async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    stream.on('error', reject);
  });
}

// Load data from S3
export async function retrieveDataFromS3(key) {
  const params = {
    Bucket: 's3input-bucket',
    Key: key
  };

  try {
    const data = await s3.send(new GetObjectCommand(params));
    const inputData = await streamToString(data.Body);
    console.log('Data loaded from S3:', JSON.parse(inputData));
    return JSON.parse(inputData);
  } catch (error) {
    console.error('Error loading data from S3:', error);
  }
}