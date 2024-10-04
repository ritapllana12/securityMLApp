import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Matrix } from 'ml-matrix';
import { encryptPassword } from './encryption.js';

const s3 = new S3Client({ region: 'eu-north-1' });
  
export async function createAndSaveMatrixToS3()  {

 const users = [
    { username: 'username1', password: '$2b$10$tfh7z/JSwLWdG0hN91FrUOclzluAWKRRS9liPo1Z9irKw.Ew3zQkW', os: 'Windows', browser: 'Chrome', locationLat: 37.7749, locationLong: -122.4194, sessionDuration: '120s', legitFlag: 1, accessHour: '14:00' },
    { username: 'username2', password: '$2b$10$tGKqeOydZBwkbcsOezMrjOVUlrI0jcvwk/r3KZ8tDenrnAO7ao3ES', os: 'macOS', browser: 'Firefox', locationLat: 40.7128, locationLong: -74.0060, sessionDuration: '150s', legitFlag: 0, accessHour: '9:00' },
    { username: 'username3', password: '$2b$10$bQlMGfaKczzA5KgR/91MS.LpfCd8axwHQpyQYqpxKhNt8bzbBvyXC', os: 'Linux', browser: 'Safari', locationLat: 34.0522, locationLong: -118.2437, sessionDuration: '180s', legitFlag: 1, accessHour: '22:00' },
    { username: 'username4', password: '$2b$10$oYt6oSNJIMFxOLw7JgCpTuLpvqN.pej09Qxxcu2Vgm0Z8yoUMNFKy', os: 'Other', browser: 'Edge', locationLat: 41.8781, locationLong: -87.6298, sessionDuration: '240s', legitFlag: 0, accessHour: '6:00' },
    { username: 'username5', password: '$2b$10$nbfruIlwxRxsxvYx18MECeu8DiPweuuoYyXenTrW.gm/f6bi.P5k6', os: 'Windows', browser: 'Chrome', locationLat: 27.1145, locationLong: -102.6789, sessionDuration: '100s', legitFlag: 1, accessHour: '12:00' },
    { username: 'username6', password: '$2b$10$I.pDQ8AXatip..0u90X3Cu71SO.RjaPy7/4GKoKMqsz8bRvf9zjUO', os: 'macOS', browser: 'Firefox', locationLat: 30.8239, locationLong: -88.1207, sessionDuration: '120s', legitFlag: 0, accessHour: '19:00' },
    { username: 'username7', password: '$2b$10$XPOMpwBUsEx7/gfOGsS42.yeBnJ1QcFDnfQa7jejujm5hpuqKKLG2', os: 'Linux', browser: 'Safari', locationLat: 32.1678, locationLong: -98.4316, sessionDuration: '140s', legitFlag: 1, accessHour: '20:00' },
    { username: 'username8', password: '$2b$10$fbKEYIazq8xbvxDpRHHIYuQOwco9wI34Z5JB/ewML.2JQsKcCtZue', os: 'Other', browser: 'Edge', locationLat: 22.1281, locationLong: -77.8256, sessionDuration: '230s', legitFlag: 0, accessHour: '8:00' },
    { username: 'username9', password: '$2b$10$O3G6q4Rl4i0dOMBK51JpGuDU.5.2Rj4t7drJ3MXv69num8aUuW4Fa', os: 'Windows', browser: 'Chrome', locationLat: 27.3468, locationLong: -112.2064, sessionDuration: '220s', legitFlag: 1, accessHour: '18:00' },
    { username: 'username10', password: '$2b$10$Jnqde4eT47awMWjXWKJ8d.1IKSLF2ixdaEy9QfQrAojTozOW8/XnS', os: 'macOS', browser: 'Firefox', locationLat: 30.6896, locationLong: -64.9867, sessionDuration: '120s', legitFlag: 0, accessHour: '16:00' },
    { username: 'username11', password: '$2b$10$i5Da.2vErgKsDJmeS45OouDhC5fiRSkPW0Nr2Hth.KxBAJYHGgxiC', os: 'Linux', browser: 'Safari', locationLat: 24.6623, locationLong: -126.1007, sessionDuration: '150s', legitFlag: 1, accessHour: '12:00' },
    { username: 'username12', password: '$2b$10$TZDHzV5p342Js.QNPkuRKuEosoYH7.dF2k3CllcPc1JHU8wFW32KK', os: 'Other', browser: 'Edge', locationLat: 31.8681, locationLong: -97.6102, sessionDuration: '120s', legitFlag: 0, accessHour: '15:00' }
  ];

  // Encrypt passwords and encode other features
  const encodedData = [];
  for (const user of users) {
    const encryptedPassword = await encryptPassword(user.password);
    encodedData.push([
      user.username,
      encryptedPassword,
      user.os,
      user.browser,
      user.locationLat,
      user.locationLong,
      user.sessionDuration,
      user.legitFlag,
      user.accessHour
    ]);
  }
  

  // Convert encoded data to matrix format
  const matrix = new Matrix(encodedData);
  
  // Save the matrix as a JSON file to S3
  const matrixJSON = JSON.stringify(matrix.to2DArray());

  const params = {
    Bucket: 's3input-bucket',
    Key: 'features.json',
    Body: matrixJSON,
    ContentType: 'application/json'
  };

  try {
    const data = await s3.send(new PutObjectCommand(params));
    console.log('Matrix saved to S3:', data);
    return "Matrix saved to S3";
  } catch (error) {
    console.error('Error saving matrix to S3:', error);
  }

};
