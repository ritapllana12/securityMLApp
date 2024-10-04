const AWS = require('aws-sdk');
const cloudwatchlogs = new AWS.CloudWatchLogs();

export async function storeLogs(event) {
    const { userName, authResult } = event;

    const params = {
        logGroupName: 'authLogs',
        logStreamName: 'authStream',
        logEvents: [
            {
                message: `User ${userName} ${authResult} to authenticate at ${new Date().toISOString()}`,
                timestamp: Date.now()
            }
        ]
    };

    try {
        await cloudwatchlogs.putLogEvents(params).promise();
        console.log('Log sent to CloudWatch');
    } catch (err) {
        console.error('Error sending log to CloudWatch:', err);
    }
};

