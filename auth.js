import AWS from 'aws-sdk';
import { createAndSaveMatrixToS3 } from './storeData.js';
import { trainRandomForestModel } from './randomForest.js';
import { trainLogisticRegressionModel } from './logisticRegression.js';

const s3 = new AWS.S3();

function addLocationNoise(latitude, longitude) {
  const latitudeNoise = (Math.random() - 0.5) * 0.0002;
  const longitudeNoise = (Math.random() - 0.5) * 0.0002;

  const newLatitude = latitude + latitudeNoise;
  const newLongitude = longitude + longitudeNoise;

  return { newLatitude, newLongitude };
}

function extractPredictionScore(resultString) {
   const match = resultString.match(/Prediction score: (\d+(\.\d+)?)/);
   return match ? parseFloat(match[1]) : null; 
 }
 

export const authenticate = async (event) => {  
  try {
    const body = JSON.parse(event.body);
    const { userName, password, os, browser, locationLat, locationLong, sessionDuration, legitFlag, accessHour } = body;

    if (!userName || !password || !os || !browser || !locationLat || !locationLong || !sessionDuration || !legitFlag || !accessHour) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' })
      };
    }


  await createAndSaveMatrixToS3();


  const { newLatitude, newLongitude } = addLocationNoise(locationLat, locationLong);

  const randomForestResult = await trainRandomForestModel(userName, password, os, browser, newLatitude, newLongitude, sessionDuration, legitFlag, accessHour);
  const logisticRegressionResult = await trainLogisticRegressionModel(userName, password, os, browser, newLatitude, newLongitude, sessionDuration, legitFlag, accessHour);

  const randomForestScore = extractPredictionScore(randomForestResult);
  const logisticRegressionScore = extractPredictionScore(logisticRegressionResult);
  let authResult = "";

  if (randomForestScore !== null && logisticRegressionScore !== null) {
    if (randomForestScore > logisticRegressionScore) {
      authResult = randomForestResult;
    } else {
      authResult = logisticRegressionResult;
    }
  } else {
    console.log("Nuk u gjetën prediction score të vlefshme në një nga stringjet.");
  }

    const newData = {
      userName,
      password,
      os,
      browser,
      newLatitude,
      newLongitude,
      sessionDuration,
      legitFlag,
      accessHour,
      result: authResult,
    };

    const params = { Bucket: 's3output-bucket', Key: 'auth-log.json' };
    let currentData;

    try {
      const data = await s3.getObject(params).promise();
      currentData = JSON.parse(data.Body.toString());
    } catch (error) {
      console.error('Error retrieving S3 data:', error);
      currentData = [];
    }

    currentData.push(newData);

    const putParams = {
      Bucket: 's3output-bucket',
      Key: 'auth-log.json',
      Body: JSON.stringify(currentData),
      ContentType: 'application/json',
    };

    await s3.putObject(putParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Data saved successfully',
        authResult,
      }),
    };
  } catch (error) {
    console.error('Error processing the request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
    };
  }
};
