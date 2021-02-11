const AWS = require('aws-sdk');
const uuid = require('node-uuid').v1;

const docClient = new AWS.DynamoDB.DocumentClient();

module.exports.addTokenVote = async(token, action) => {
    let result = await docClient.put({
        TableName: "polls",
        Item: {
            id: uuid(),
            token,
            action,
        }
    }).promise();
    return result;
}

module.exports.getVote = async() => {
    let result = await docClient.scan({
        TableName: "polls",
    }).promise();
    console.log('has vote result', result)
    return result;
}

module.exports.clearVote = async() => {
    const votes = await module.exports.getVote();
    await docClient.delete(votes.map((vote) => vote.id))
};