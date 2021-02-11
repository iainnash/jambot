const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

module.exports.updateVote = async(votes) => {
    let result = await docClient.put({
        TableName: "votes",
        Item: {
            id: "VOTES",
            votes,
        }
    }).promise();
    console.log('updateVote', result);
    return result;
}

module.exports.getActionVotes = async() => {
    let result = await docClient.scan({
        TableName: "votes",
    }).promise();
    return result;
}