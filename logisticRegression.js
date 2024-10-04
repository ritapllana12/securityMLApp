
import express from 'express';
import LogisticRegression from 'ml-logistic-regression';
import { Matrix } from 'ml-matrix';
import AWS from 'aws-sdk';
AWS.config.update({ region: 'eu-north-1' });
import { encryptPassword } from './encryption.js';
import { retrieveDataFromS3 } from './getData.js';
import { encodeFeatures } from './encodeFeatures.js';

const app = express();
app.use(express.json()); 


//Machine Learning algorimi për të trajnuar modelin dhe për të bërë parashikim
export async function trainLogisticRegressionModel(username, password, os, browser, locationLat, locationLong, sessionDuration, legitFlag, accessHour) {

    const featuresFileKey = 'features.json';
    const retrievedFeatures = await retrieveDataFromS3(featuresFileKey);
    const Y = new Matrix([[1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1], [0]])

    const encodedX = retrievedFeatures.map(encodeFeatures);
    const xMatrix = new Matrix(encodedX);

   for (let i = 0; i < encodedX.length; i++) {
     for (let j = 0; j < encodedX[i].length; j++) {
        if (j > 8) {
        console.error(`Error: Trying to access column index ${j} beyond range.`);
      }
    }
  }

  const logisticRegression = new LogisticRegression({ 
    numSteps: 1000, 
    learningRate: 5e-3,
    zeroIntercept: false
  });
  
    try {
      logisticRegression.train(xMatrix, Y);
      const result = logisticRegression.predict(xMatrix);
      console.log('Logistic Regression model trained successfully.', result); 
    } catch (error) {
      console.error('Error during training:', error);
      return;
    }

    const encryptedPassword = await encryptPassword(password);
  
    // Matrix for real-time user input
    const userInput = new Matrix([[username, encryptedPassword, os, browser, locationLat, locationLong, sessionDuration, legitFlag, accessHour]]);
    const encodedUserInput = encodeFeatures(userInput[0]);

    const X = new Matrix([encodedUserInput]);
    const prediction = logisticRegression.predict(X);
    console.log("prediction", prediction);
  
    // Return authentication result
    const authResult = prediction[0] === 1
    ? `User authenticated successfully. Prediction score: ${prediction[0]}`
    : `Authentication failed. Suspicious behavior detected. Prediction score: ${prediction[0]}`;
    return authResult;
}