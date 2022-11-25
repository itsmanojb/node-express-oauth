const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { timeout } = require("./utils");

const config = {
  port: 9002,
  publicKey: fs.readFileSync("assets/public_key.pem"),
};

const users = {
  user1: {
    username: "user1",
    name: "User 1",
    date_of_birth: "7th October 1990",
    weight: 57,
  },
  john: {
    username: "john",
    name: "John Appleseed",
    date_of_birth: "12th September 1998",
    weight: 87,
  },
};

const app = express();
app.use(timeout);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
Your code here
*/

app.get("/user-info", (req, res) => {
  let authCredentials = req.headers.authorization;
  if (!authCredentials) {
    res.status(401).send("Error: not authorized");
    return;
  }
  const authToken = authCredentials.slice("bearer ".length);
  let userInfo = null;
  try {
    userInfo = jwt.verify(authToken, config.publicKey, {
      algorithms: ["RS256"],
    });
  } catch (e) {
    res.status(401).send("Error: client unauthorized");
    return;
  }
  if (!userInfo) {
    res.status(401).send("Error: client unauthorized");
    return;
  }
  const { userName, scope } = userInfo;
  const userWithRestrictedFields = {};
  const scopes = scope.split(" ");
  for (let i = 0; i < scopes.length; i++) {
    const field = scopes[i].slice("permission:".length);
    userWithRestrictedFields[field] = users[userName][field];
  }

  res.json(userWithRestrictedFields);
});

const server = app.listen(config.port, "localhost", function () {
  var host = server.address().address;
  var port = server.address().port;
});
["RS256"];

// for testing purposes
module.exports = {
  app,
  server,
};
