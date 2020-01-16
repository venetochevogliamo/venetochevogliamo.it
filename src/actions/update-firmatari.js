var rp = require("request-promise");
const fs = require("fs");
require("dotenv").config();

const { MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID, MAILCHIMP_REGION } = process.env;

function capitalizeFirstLetter(string) {
  return string
    .toLowerCase()
    .split(" ")
    .map(s => s.charAt(0).toUpperCase() + s.substring(1))
    .join(" ");
}

async function GetFirmatari() {
  let completed = false;
  let firmatari = [];
  let offset = 0;
  while (!completed) {
    let options = {
      url: `https://${MAILCHIMP_REGION}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/`,
      qs: {
        fields: ["members.status", "members.merge_fields"],
        count: 1000,
        offset: offset
      },
      headers: {
        Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json"
      }
    };
    let body = await rp.get(options);
    let json = JSON.parse(body);

    json.members.map(user => {
      const { APPELLO, FIRSTNAME, LASTNAME, COMUNE } = user.merge_fields;
      // check if user has signed and not pending
      if (user.status != "pending" && APPELLO != "") {
        firmatari.push({
          nome:
            capitalizeFirstLetter(LASTNAME) +
            " " +
            capitalizeFirstLetter(FIRSTNAME),
          comune: COMUNE
        });
      }
    });
    if (json.members.length < 1000) {
      completed = true;
    } else {
      offset += 1000;
    }
  }
  return firmatari;
}

async function SortFirmatari() {
  const firmatari = await GetFirmatari();
  firmatari.sort((a, b) => (a.nome > b.nome ? 1 : -1));
  return firmatari;
}

async function GenerateJSONFirmatari() {
  const firmatari = await SortFirmatari();
  fs.writeFileSync("./_data/appello-firmatari.json", JSON.stringify(firmatari));
}
GenerateJSONFirmatari();
