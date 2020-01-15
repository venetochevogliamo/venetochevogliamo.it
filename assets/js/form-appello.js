// Appello
const max = 2; // max number of possible choices

document.addEventListener("change", function(e) {
  if (e.target.tagName == "INPUT") {
    if (
      document.querySelectorAll("#themes input[type='checkbox']:checked")
        .length > max
    ) {
      e.target.checked = false;
      // console.log(`${max} buttons are alraedy checked!`);
    }
  }
  // Check at least 2 checkbox are checked and gdpr
  if (document.getElementById("gdpr").checked == true) {
    document.getElementById("submit").disabled = false;
  } else {
    document.getElementById("submit").disabled = true;
  }
});

/////////////
// submit //
///////////

//post request URL
const URL = "/.netlify/functions/appello";

//function to make a post request to lambda function using the fetch API
const sendEmail = async (url, data = {}) => {
  return await fetch(url, {
    method: "POST",
    body: data
  })
    .then(response => response.json())
    .catch(error => console.error(error));
};

//get form element
submissionFeedback = document.querySelector("#submissionFeedback");
emailForm = document.querySelector("#appelloForm");
emailForm.addEventListener("submit", e => {
  var recaptcha = $("#g-recaptcha-response").val();
  if (recaptcha === "") {
    e.preventDefault();
    alert("Errore: verifica di sicurezza mancate");
  } else {
    e.preventDefault();

    //create input object to send as body of the event when the lambda function is invoked
    const message = $("#appelloForm").serialize();

    sendEmail(URL, message)
      .then(response => {
        //if successful show feedback to client
        if (response.result === "success") {
          submissionFeedback.innerText =
            "Grazie! Per favore controlla la tua email.";
          submissionFeedback.className = "alert alert-success";
          emailForm.style.display = "none";
        } else {
          submissionFeedback.innerText = response.result;
          submissionFeedback.className = "alert alert-danger";
        }
      })
      .catch(error => {
        // console.log(error);
        submissionFeedback.innerText = error;
        submissionFeedback.className = "alert alert-danger";
      });
  }
});
