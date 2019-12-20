const request = require("request");
const queryString = require("query-string");
const md5 = require("md5");

import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const { MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID, MAILCHIMP_REGION } = process.env;

const checkCaptcha = async code => {
  return new Promise((resolve, reject) => {
    const { RECAPTCHA_PRIVATE } = process.env;

    const verificationURL =
      "https://www.google.com/recaptcha/api/siteverify?secret=" +
      RECAPTCHA_PRIVATE +
      "&response=" +
      code;

    // validate reCAPTCHA
    request(verificationURL, function(error, response, body) {
      body = JSON.parse(body);
      if (body.success !== undefined && !body.success) {
        return reject("Failed Captcha Verification");
      }
      resolve();
    });
  });
};

const checkMC = async email => {
  return new Promise((resolve, reject) => {
    const memberID = md5(email.toLowerCase());

    request(
      {
        method: "GET",
        url: `https://${MAILCHIMP_REGION}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${memberID}/?fields=merge_fields`,
        headers: {
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
          "Content-Type": "application/json"
        }
      },
      (error, response, body) => {
        const bodyObj = JSON.parse(body);

        if (response.statusCode === 200) {
          // console.log(bodyObj);
          if (bodyObj.merge_fields["APPELLO"] === 1) {
            return reject("Already Submitted");
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      }
    );
  });
};

const subscribeMC = async formData => {
  return new Promise((resolve, reject) => {
    // validated and secure
    const memberID = md5(formData.EMAIL.toLowerCase());
    var marketing;

    // newsletter optin
    if (formData.OPTIN !== undefined && formData.OPTIN !== "true") {
      marketing = [
        {
          marketing_permission_id: "5cb1a1ba50",
          enabled: true
        },
        {
          marketing_permission_id: "259840363e",
          enabled: true
        }
      ];
    } else {
      marketing = [
        {
          marketing_permission_id: "259840363e",
          enabled: true
        }
      ];
    }
    const data = {
      email_address: formData.EMAIL,
      //status_if_new: "pending",
      status: "pending",
      merge_fields: {
        FIRSTNAME: formData.FIRSTNAME,
        LASTNAME: formData.LASTNAME,
        PROVINCIA: formData.PROVINCIA,
        COMUNE: formData.COMUNE,
        APPELLO: "1"
      },
      interests: {
        c2c154531d: formData.OPTION1 === "true" ? true : false,
        fa655bb0fc: formData.OPTION2 === "true" ? true : false,
        "217e318bc7": formData.OPTION3 === "true" ? true : false,
        "624c3f9edf": formData.OPTION4 === "true" ? true : false,
        "9141ce6ea6": formData.OPTION5 === "true" ? true : false,
        "0c4892e8a6": formData.OPTION6 === "true" ? true : false,
        b28830ad31: formData.OPTION7 === "true" ? true : false
      },
      marketing_permissions: marketing
    };
    const subscriber = JSON.stringify(data);
    // console.log("Sending data to mailchimp", subscriber);
    request(
      {
        method: "PUT",
        url: `https://${MAILCHIMP_REGION}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${memberID}/`,
        body: subscriber,
        headers: {
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
          "Content-Type": "application/json"
        }
      },
      (error, response, body) => {
        if (error) {
          reject(error);
        }
        const bodyObj = JSON.parse(body);
        //console.log("Mailchimp body: " + JSON.stringify(bodyObj));
        //console.log("Status Code: " + response.statusCode);
        if (response.statusCode === 200) {
          console.log("Added to list in Mailchimp subscriber list");
          resolve();
        } else {
          console.log("Error from MailChimp", bodyObj.detail);
          reject(bodyObj.detail);
        }
      }
    );
  });
};

exports.handler = async event => {
  const formData = queryString.parse(event.body);
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Method Not Accepted"
      })
    };
  } else {
    try {
      await checkCaptcha(formData["g-recaptcha-response"]);
      await checkMC(formData.EMAIL);
      await subscribeMC(formData);

      return {
        statusCode: 201,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true"
        },
        body: JSON.stringify({
          result: "success"
        })
      };
    } catch (e) {
      if (e === "Failed Captcha Verification") {
        return {
          statusCode: 400,
          body: JSON.stringify({
            result: "La verifica di sicurezza non valida"
          })
        };
      } else if (e === "Already Submitted") {
        return {
          statusCode: 400,
          body: JSON.stringify({
            result: "Hai già sottoscritto questo appello"
          })
        };
      }
      return {
        statusCode: 500,
        body: JSON.stringify({
          result: e
        })
      };
    }
  }
};
