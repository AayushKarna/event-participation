"use strict";

const registrationForm = document.getElementById("registration-form");
const registrationNumberContainer = document.getElementById(
  "registration-number-container"
);
const successCard = document.getElementById("success-card");
const registrationCard = document.getElementById("registraion-card");

const qrCantainer = document.querySelector(".qrCode");

const turnOnBtnLoading = function (btn, loadingText = "Loading...") {
  btn.disabled = true;

  btn.querySelector(".spin").classList.remove("hidden-el");
  btn.querySelector("span").textContent = loadingText;
};

const turnOffBtnLoading = function (btn, originalText = "Submit") {
  btn.disabled = false;

  btn.querySelector(".spin").classList.add("hidden-el");
  btn.querySelector("span").textContent = originalText;
};

const alertError = function (message) {
  const alert = document.createElement("p");
  alert.textContent = `⚠️ ${message}`;
  alert.classList.add("alert", "alert--error");

  registrationForm.insertAdjacentElement("beforebegin", alert);
};

registrationForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = new FormData(registrationForm);

  const reqConfig = {
    method: "POST",
    body: formData,
  };

  try {
    turnOnBtnLoading(
      registrationForm.querySelector('button[type="submit"]'),
      "Registering..."
    );

    const res = await fetch(
      "https://mokshaeats.com/ak/register.php",
      reqConfig
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Something went wrong!");
    }

    const { full_name: fullName, registration_number: regNumber, phone } = data;

    const qrcode = new QRCode(qrCantainer, {
      text: `Name: ${fullName} \nPhone: ${phone}\nRegistration number: ${regNumber}`,
      width: 128,
      height: 128,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });

    registrationCard.classList.add("hidden-el");
    registrationNumberContainer.textContent = data["registration_number"];
    successCard.classList.remove("hidden-el");
  } catch (error) {
    const existingAlerts = registrationCard.querySelectorAll(".alert--error");
    existingAlerts.forEach((alert) => alert.remove());
    alertError(error.message || "Something went wrong!");
  } finally {
    turnOffBtnLoading(
      registrationForm.querySelector('button[type="submit"]'),
      "Register"
    );
  }
});
