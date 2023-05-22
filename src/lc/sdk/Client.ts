// client.js
const { CognitoIdentityClient, GetIdCommand } = require("@aws-sdk/client-cognito-identity");
const { fromCognitoIdentity } = require("@aws-sdk/credential-provider-cognito-identity");
const { SignatureV4 } = require("@aws-sdk/signature-v4");
const { formatUrl } = require("@aws-sdk/util-format-url");
const { HttpRequest } = require("@aws-sdk/protocol-http");
const { Sha256 } = require("@aws-crypto/sha256-universal");
const axios = require("axios");
require("dotenv").config();

class Client {
  constructor(idToken, accessToken) {
    this.idToken = idToken;
    this.accessToken = accessToken;
    this.client = new CognitoIdentityClient({ region: "region" });
  }

  async authenticate() {
    try {
      const getIdResult = await this.client.send(
        new GetIdCommand({
          IdentityPoolId: "region:**************************************",
          Logins: {
            "cognito-idp.region.amazonaws.com/region_********": this.idToken,
          },
        })
      );

      this.credentials = fromCognitoIdentity({
        client: this.client,
        identityId: getIdResult.IdentityId,
        logins: {
          "cognito-idp.region.amazonaws.com/region_********": this.idToken,
        },
      });
    } catch (error) {
      console.error("Error getting the Cognito IdentityId", error);
    }
  }

  async request(method, endpoint, body?: any) {
    const signer = new SignatureV4({
      credentials: this.credentials,
      region: "region",
      service: "execute-api",
      sha256: Sha256,
    });

    const request = new HttpRequest({
      method: method,
      protocol: "https",
      path: endpoint,
      headers: {
        host: "api.l******n.dev",
        Authorization: `Bearer ${this.accessToken}`,
      },
      hostname: "api.l******n.dev",
    });

    try {
      const cred = await this.credentials();
      const signedRequest = await signer.sign(request, {
        accessKeyId: cred.accessKeyId,
        secretAccessKey: cred.secretAccessKey,
        sessionToken: cred.sessionToken,
      });

      const response = await axios({
        method: signedRequest.method,
        url: formatUrl(signedRequest),
        headers: signedRequest.headers,
      });

      return response.data;
    } catch (error) {
      console.error("Error in the HTTP request", error.message);
    }
  }
}

export { Client }