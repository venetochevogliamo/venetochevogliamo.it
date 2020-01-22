const request = require("request");
const queryString = require("query-string");
const md5 = require("md5");

import { config as dotenvConfig } from "dotenv";
import validator from "validator";

dotenvConfig();

const { MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID, MAILCHIMP_REGION } = process.env;

const validateInput = async data => {
  return new Promise((resolve, reject) => {
    if (!validator.isEmail(data.EMAIL)) {
      reject("E-Mail non valida");
    } else {
      resolve();
    }
  });
};
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
        url: `https://${MAILCHIMP_REGION}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${memberID}/`,
        headers: {
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
          "Content-Type": "application/json"
        }
      },
      (error, response, body) => {
        const bodyObj = JSON.parse(body);

        if (response.statusCode === 200) {
          // console.log(bodyObj);
          if (
            bodyObj.merge_fields["APPELLO"] !== "" &&
            bodyObj.status !== "pending"
          ) {
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
    const email = validator.normalizeEmail(formData.EMAIL, {
      gmail_remove_dots: false
    });
    const memberID = md5(email);
    var marketing;

    // newsletter optin
    if (formData.OPTIN !== undefined && formData.OPTIN === "true") {
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
      email_address: email,
      //status_if_new: "pending",
      status: "pending",
      merge_fields: {
        FIRSTNAME: validator.escape(formData.FIRSTNAME),
        LASTNAME: validator.escape(formData.LASTNAME),
        PROVINCIA: validator.escape(formData.PROVINCIA),
        COMUNE: validator.escape(formData.COMUNE),
        APPELLO: new Date().getTime()
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
          console.log("New member added");
          resolve();
        } else {
          console.log("MailChimp Error: ", bodyObj.detail);
          reject(bodyObj.detail);
        }
      }
    );
  });
};

exports.handler = async event => {
  console.log("EVENT\n" + JSON.stringify(event, null, 2));
  const formData = queryString.parse(event.body);
  if (event.httpMethod !== "POST") {
    let msg = "Method Not Accepted";
    console.log(msg);
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: msg
      })
    };
  } else {
    try {
      await validateInput(formData);
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
        let msg = "Errore: verifica di sicurezza non valida. Riprova.";
        console.log(msg);
        return {
          statusCode: 400,
          body: JSON.stringify({
            result: msg
          })
        };
      } else if (e === "Already Submitted") {
        let msg = "Errore: hai già sottoscritto questo appello.";
        console.log(msg);
        return {
          statusCode: 400,
          body: JSON.stringify({
            result: msg
          })
        };
      } else {
        console.log("Error: " + e);
        return {
          statusCode: 500,
          body: JSON.stringify({
            result: e
          })
        };
      }
    }
  }
};
