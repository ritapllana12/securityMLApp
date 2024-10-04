
import express from 'express';
import { Matrix } from 'ml-matrix';
import AWS from 'aws-sdk';
AWS.config.update({ region: 'eu-north-1' });
import { encryptPassword } from './encryption.js';
import { retrieveDataFromS3 } from './getData.js';
import { encodeFeatures } from './encodeFeatures.js';
import { RandomForestRegression as RFRegression } from 'ml-random-forest';

const app = express();
app.use(express.json()); 

export async function trainRandomForestModel(username, password, os, browser, locationLat, locationLong, sessionDuration, legitFlag, accessHour) {

    const featuresFileKey = 'features.json';

    const retrievedFeatures = await retrieveDataFromS3(featuresFileKey);
    const X = retrievedFeatures;
    const Y = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]; 

    const encodedX = X.map(encodeFeatures);
    console.log("encodedX", encodedX);

   for (let i = 0; i < encodedX.length; i++) {
     for (let j = 0; j < encodedX[i].length; j++) {
        if (j > 8) {
        console.error(`Error: Trying to access column index ${j} beyond range.`);
      }
    }
  }

    // Create Random Forest Classifier
    const options = {
      seed: 8, 
      maxFeatures: 7,
      replacement: false,
      nEstimators: 200
    };
    const regression = new RFRegression(options);
  
    try {
      regression.train(encodedX, Y);
      const result = regression.predict(encodedX);
      console.log('Random Forest model trained successfully.', result); 
    } catch (error) {
      console.error('Error during training:', error);
      return;
    }

    const encryptedPassword = await encryptPassword(password);
  
    // Matrix for real-time user input
    const userInput = new Matrix([[username, encryptedPassword, os, browser, locationLat, locationLong, sessionDuration, legitFlag, accessHour]]);
    const encodedUserInput = encodeFeatures(userInput[0]);

    const prediction = regression.predict([encodedUserInput]);
    console.log("prediction: ", prediction);

    // Return authentication result
    const authResult = prediction[0] >= 0.5 
    ? `User authenticated successfully. Prediction score: ${prediction[0].toFixed(4)}`
    : `Authentication failed. Suspicious behavior detected. Prediction score: ${prediction[0].toFixed(4)}`;    
    return authResult;
}
