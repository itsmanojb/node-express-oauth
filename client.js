const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios").default;
const url = require("url");
const { randomString, timeout } = require("./utils");

const config = {
  port: 9000,

  clientId: "my-client",
  clientSecret: "zETqHgl0d7ThysUqPnaFuLOmG1E=",
  redirectUri: "http://localhost:9000/callback",

  authorizationEndpoint: "http://localhost:9001/authorize",
  tokenEndpoint: "http://localhost:9001/token",
  userInfoEndpoint: "http://localhost:9002/user-info",
};
let state = "";

const app = express();
app.set("view engine", "ejs");
app.set("views", "assets/client");
app.use(timeout);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
Your code here
*/
app.get("/authorize", (req, res) => {
  state = randomString();
  const { authorizationEndpoint, clientId, redirectUri } = config;
  const redirectUrl = url.parse(authorizationEndpoint);
  redirectUrl.query = {
    state,
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "permission:name permission:date_of_birth",
  };

  res.redirect(url.format(redirectUrl));
});

app.get("/callback", (req, res) => {
  if (state !== req.query.state) {
    res.status(403).send("Error: forbidden");
    return;
  }
  axios({
    method: "POST",
    url: config.tokenEndpoint,
    auth: {
      username: config.clientId,
      password: config.clientSecret,
    },
    data: { code: req.query.code },
    validateStatus: null,
  }).then(({ data }) => {
    return axios({
      method: "GET",
      url: config.userInfoEndpoint,
      headers: {
        authorization: `bearer ${data.access_token}`,
      },
    })
      .then((response) => {
        res.render("welcome", { user: response.data });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: something went wrong");
      });
  });
});

const server = app.listen(config.port, "localhost", function () {
  var host = server.address().address;
  var port = server.address().port;
});

// for testing purposes

module.exports = {
  app,
  server,
  getState() {
    return state;
  },
  setState(s) {
    state = s;
  },
};
