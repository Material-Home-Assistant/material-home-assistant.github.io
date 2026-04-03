const SUPPORT_EMAIL = "support@materialhomeassistant.com";

const env = {
  login_url: "https://billing.stripe.com/p/login/test_28E00kdTh5pWam2b21gnK00",
  download_free_url:
    "https://my.home-assistant.io/redirect/hacs_repository/?repository=lovelace-material-components&owner=giovannilamarmora&category=Plugin",
  /** Pro Plan */
  pro_monthly: "https://buy.stripe.com/test_28E00kdTh5pWam2b21gnK00",
  pro_annual: "https://buy.stripe.com/test_28EaEY2az4lSbq62vvgnK01",
  //pro_one_time: "https://buy.stripe.com/test_4gMcN60GT9Vs661dez9fW02",
  /** Ultimate Plan */
  ultimate_monthly: "https://buy.stripe.com/test_5kQ5kE2az7y4eCib21gnK02",
  ultimate_annual: "https://buy.stripe.com/test_28E9AUcPdcSo79Q2vvgnK03",
  //ultimate_one_time: "https://buy.stripe.com/test_cNibJ2exJffMbqleiD9fW05",
  /** Documentation */
  documentation: "https://materialhomeassistant.com/docs/setup/overview",
  community:
    "https://community.home-assistant.io/t/introducing-the-google-components/916428",
  website: "https://giovannilamarmora.github.io",
  instagram: "https://www.instagram.com/gio_lamarmora",
  github: "https://github.com/giovannilamarmora",
  linkedin: "https://www.linkedin.com/in/giovannilamarmora/",
  support: SUPPORT_EMAIL,
  emailSupport: "mailto:" + SUPPORT_EMAIL,
};

function init() {
  document.getElementById("loginBtn").href = env.login_url;
  document.getElementById("downloadFreeBtn").href = env.download_free_url;
  document.getElementById("support").innerText = env.support;
}

document.addEventListener("DOMContentLoaded", init);
