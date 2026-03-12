document.addEventListener("DOMContentLoaded", () => {
  // Initialize AOS
  AOS.init({
    duration: 800,
    once: true,
    offset: 100,
  });

  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  const navbarCollapse = document.getElementById("navbarContent");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Previeni il comportamento standard per fare uno scroll fluido
      e.preventDefault();

      // Chiudi il menu mobile se è aperto
      if (navbarCollapse.classList.contains("show")) {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
          toggle: true,
        });
        bsCollapse.hide();
      }

      // Prendi l'ID della sezione dall'href
      const targetId = this.getAttribute("href").substring(1);
      const targetEl = document.getElementById(targetId);

      if (targetEl) {
        // Calcola la posizione corretta considerando l'altezza della navbar
        const navbarHeight = document.querySelector(".navbar").offsetHeight;
        const elementPosition = targetEl.offsetTop - navbarHeight;

        // Scroll fluido
        window.scrollTo({
          top: elementPosition,
          behavior: "smooth",
        });
      }
    });
  });
});

function openPage(hrefOrKey, blank = true) {
  if (!hrefOrKey) return;

  // Controlla se è una chiave nell'oggetto env
  const url = env[hrefOrKey] || hrefOrKey;

  // Apri il link in una nuova scheda
  if (blank) {
    window.open(url, "_blank");
  } else {
    window.location.href = url;
  }
}

/**
 * Features for free, pro, advanced
 */
const featuresFree = `
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Material Dashboard Card (Basic)</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Material Button Card</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Material Slider Card</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Material Climate Card</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Material Lights Card</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Material Control Card</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Material User Card</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Material Menu Card</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Material Media Page</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Material Sensor Dialog (Basic)</li>
    <li><i class="bi bi-x-circle-fill text-danger me-2"></i> Fast Updates</li>
    <li><i class="bi bi-x-circle-fill text-danger me-2"></i> Feature Request (Slow)</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Community Support</li>
  `;

const featuresPro = `
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> All Free components</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Material Dashboard Card (Advanced)</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Material Options Card</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Material Circle Progress Card</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Advanced Actions</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Lifetime Updates</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Fast Updates</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Feature Request</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Priority Support</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> 1 Device Installation</li>
  `;

//const featuresPro = `
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> All Free components</li>
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Material Dashboard Card (Advanced)</li>
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Editor Page</li>
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Control Card</li>
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Climate Card</li>
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Menu Card</li>
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Other Premium Card</li>
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Lifetime Updates</li>
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Fast Updates</li>
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Priority Support</li>
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> 1 Device Installation</li>
//  `;

const featuresUltimate = `
    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Everything in Pro</li>
  `;

//const featuresUltimate = `
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Everything in Pro</li>
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Custom Components</li>
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Media Player Page</li>
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Custom Dialog (Sensor and other)</li>
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> Dedicated Support</li>
//    <li><i class="bi bi-check-circle-fill text-success me-2"></i> 3 Device Installation</li>
//  `;

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll("#free_monthly, #free_annual, #free_one_time")
    .forEach((el) => {
      el.innerHTML += featuresFree;
    });

  document
    .querySelectorAll("#pro_monthly, #pro_annual, #pro_one_time")
    .forEach((el) => {
      el.innerHTML += featuresPro;
    });

  document
    .querySelectorAll("#ultimate_monthly, #ultimate_annual, #ultimate_one_time")
    .forEach((el) => {
      el.innerHTML += featuresUltimate;
    });
});
/**
 * END Features for free, pro, advanced
 */
