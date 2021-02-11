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
    return result.Items;
}

module.exports.clearVote = async() => {
    const votes = await module.exports.getVote();
    await votes.forEach(async({ id }) => {
        console.log('deleting', id)
        const r = await docClient.delete({
            TableName: "polls",
            Key: {
                id
            }
        }).promise();
        console.log(r);
    })
};