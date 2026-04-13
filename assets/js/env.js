const SUPPORT_EMAIL = "support@materialhomeassistant.com";

const env = {
  login_url: "https://billing.stripe.com/p/login/dRm6oH5xgg1nelV0eE6AM00",
  download_free_url:
    "https://my.home-assistant.io/redirect/hacs_repository/?repository=lovelace-material-components&owner=giovannilamarmora&category=Plugin",
  /** Pro Plan */
  pro_monthly: "https://buy.stripe.com/dRm14ne3MeXj4Ll2mM6AM01",
  pro_annual: "https://buy.stripe.com/3cI8wPf7QbL72Dd2mM6AM02",
  //pro_one_time: "https://buy.stripe.com/test_4gMcN60GT9Vs661dez9fW02",
  /** Ultimate Plan */
  ultimate_monthly: "https://buy.stripe.com/cNiaEXgbU16t4LlgdC6AM03",
  ultimate_annual: "https://buy.stripe.com/aFa5kD5xg2ax4Lle5u6AM04",
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
