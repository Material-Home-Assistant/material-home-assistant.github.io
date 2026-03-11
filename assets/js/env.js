const env = {
  login_url: "https://billing.stripe.com/p/login/test_3cI9AUexJ0kSfGB5M79fW00",
  download_free_url:
    "https://my.home-assistant.io/redirect/hacs_repository/?repository=lovelace-material-components&owner=giovannilamarmora&category=Plugin",
  pro_monthly:
    "https://buy.stripe.com/test_3cI9AUexJ0kSfGB5M79fW00",
  pro_annual:
    "https://buy.stripe.com/test_28E4gAdtF6JgfGBcav9fW01",
  pro_one_time: "https://buy.stripe.com/test_4gMcN60GT9Vs661dez9fW02",
  ultimate_monthly:
    "https://buy.stripe.com/test_6oU6oIfBN8Robqldez9fW03",
  ultimate_annual:
    "https://buy.stripe.com/test_bJe00k4X99Vs661b6r9fW04",
  ultimate_one_time: "https://buy.stripe.com/test_cNibJ2exJffMbqleiD9fW05",
  documentation: "https://giovannilamarmora.gitbook.io/material-home-component",
  community:
    "https://community.home-assistant.io/t/introducing-the-google-components/916428",
  website: "https://giovannilamarmora.github.io",
  instagram: "https://www.instagram.com/gio_lamarmora",
  github: "https://github.com/giovannilamarmora",
  linkedin: "https://www.linkedin.com/in/giovannilamarmora/",
};

function init() {
  document.getElementById("loginBtn").href = env.login_url;
  document.getElementById("downloadFreeBtn").href = env.download_free_url;
}

document.addEventListener("DOMContentLoaded", init);
