const AWS = require('aws-sdk');
const sns = new AWS.SNS();

export async function sendSns() {
    const { userName, authResult } = event;

    if (authResult === 'Failed') {
        const params = {
            Message: `User ${userName} failed to authenticate.`,
            Subject: 'Failed Authentication Alert',
            TopicArn: 'arn:aws:sns:eu-north-1:536697254807:authSNS'
        };

        try {
            await sns.publish(params).promise();
            console.log('SNS message sent');
        } catch (err) {
            console.error('Error sending SNS message:', err);
        }
    }
};