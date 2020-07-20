const MongoClient = require("mongodb").MongoClient;

const dbUrl = process.env.DB_CONNECTION;
const dbName = process.env.DB_NAME;
const collection = process.env.COLLECTION_COURSE;

const client = new MongoClient(dbUrl,  {useNewUrlParser: true, useUnifiedTopology: true });

function initialize(
  successCallback,
  failureCallback
) {
  client.connect(function (err, dbClient) {
    if (err) {
      console.log(`MongoDB connection error: ${err}`);
      failureCallback(err);
    } else {
      const dbObject = dbClient.db(dbName);
      const dbCollection = dbObject.collection(collection);
      console.log("MongoDB connected successfully");
      successCallback(dbCollection);
    }});
}

module.exports = { initialize };