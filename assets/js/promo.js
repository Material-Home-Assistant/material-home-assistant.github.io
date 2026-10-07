/**
 * Material Home Assistant - Promotional Banner Controller
 * Handles loading JSONC configuration, calculating discounts, scheduling,
 * and rendering promotional banners for Monthly and Annual plans.
 */

/**
 * Base regular prices on the website for discount calculations.
 * Used to compute exact integer discount percentages when custom prices are set.
 * 
 * @constant
 * @type {Record<string, { monthly: number, annual: number }>}
 */
const BASE_PRICES = {
  pro: {
    monthly: 2.99,
    annual: 24.90
  },
  ultimate: {
    monthly: 5.99,
    annual: 49.90
  }
};

/**
 * Strips single-line (//) and multi-line (/* *\/) comments from JSONC text,
 * preserving strings that contain comment-like characters (e.g. URLs).
 * 
 * @param {string} jsoncText - The raw JSONC string with comments.
 * @returns {string} Sanitized JSON-compatible string.
 */
function stripJsonComments(jsoncText) {
  if (typeof jsoncText !== "string") return "";
  // 1. Strip single-line and multi-line comments
  const withoutComments = jsoncText.replace(
    /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
    (match, commentGroup) => (commentGroup ? "" : match)
  );
  // 2. Strip trailing commas before closing brackets or braces (common when commenting out lines)
  return withoutComments.replace(/,\s*([}\]])/g, "$1");
}

/**
 * Calculates the discount percentage between an original price and a discounted price.
 * Rounds to an integer without any decimals (e.g. 33%, 20%).
 * 
 * @param {number} originalPrice - The standard regular price.
 * @param {number} discountedPrice - The customized discounted price.
 * @returns {number} Integer discount percentage (0 to 100).
 */
function calculateDiscountPercentage(originalPrice, discountedPrice) {
  if (
    typeof originalPrice !== "number" ||
    typeof discountedPrice !== "number" ||
    discountedPrice >= originalPrice ||
    originalPrice <= 0
  ) {
    return 0;
  }
  // Formula: Math.round(((Base - Scontato) / Base) * 100)
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

/**
 * Checks if the promotional banner is within its valid date period.
 * 
 * @param {string|null|undefined} startDate - Optional start date string (e.g. "2026-10-01" or ISO timestamp).
 * @param {string|null|undefined} endDate - Optional end date string (e.g. "2026-12-31" or ISO timestamp).
 * @returns {boolean} True if current date is within the allowed interval, false otherwise.
 */
function isPromoDateActive(startDate, endDate) {
  const now = new Date();

  // If a start date is specified, verify current time has reached or passed it
  if (startDate && typeof startDate === "string" && startDate.trim() !== "") {
    const start = new Date(startDate.trim());
    if (!isNaN(start.getTime()) && now < start) {
      return false;
    }
  }

  // If an end date is specified, verify current time has not exceeded it
  if (endDate && typeof endDate === "string" && endDate.trim() !== "") {
    let endStr = endDate.trim();
    // If only date is provided (YYYY-MM-DD), default to end of that day (23:59:59.999)
    if (endStr.length === 10) {
      endStr += "T23:59:59.999";
    }
    const end = new Date(endStr);
    if (!isNaN(end.getTime()) && now > end) {
      return false;
    }
  }

  return true;
}

/**
 * Copies the coupon code to the system clipboard and displays visual feedback.
 * 
 * @param {string} code - The coupon code string to copy.
 * @param {HTMLElement|null} [triggerBtn=null] - The copy button element to update with feedback.
 * @returns {Promise<void>}
 */
async function copyPromoCode(code, triggerBtn = null) {
  if (!code) return;

  const btn = triggerBtn || document.getElementById("promoCopyBtn");

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(code);
    } else {
      // Fallback for non-secure contexts or older browsers
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    if (btn) {
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<i class="bi bi-check2 me-1"></i><span>Copied!</span>`;
      btn.classList.add("copied");

      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.classList.remove("copied");
      }, 2500);
    }
  } catch (err) {
    console.error("Failed to copy coupon code:", err);
  }
}

/**
 * Toggles the visibility of the "How to apply" instructions accordion.
 * Works as a standalone toggle or harmonizes with Bootstrap collapse.
 * 
 * @param {string} targetId - ID of the collapse container element.
 * @param {HTMLElement} toggleBtn - The button triggering the toggle.
 */
function togglePromoInstructions(targetId, toggleBtn) {
  const target = document.getElementById(targetId);
  if (!target) return;

  // Use Bootstrap Collapse if available
  if (window.bootstrap && window.bootstrap.Collapse) {
    const bsCollapse = bootstrap.Collapse.getOrCreateInstance(target, { toggle: false });
    bsCollapse.toggle();
  } else {
    // Standalone fallback if Bootstrap JS is not ready
    const isExpanded = target.classList.contains("show");
    if (isExpanded) {
      target.classList.remove("show");
      toggleBtn.setAttribute("aria-expanded", "false");
    } else {
      target.classList.add("show");
      toggleBtn.setAttribute("aria-expanded", "true");
    }
  }
}

/**
 * Computes discount details and badges for a specific plan type ("monthly" or "annual").
 * 
 * @param {Object} config - Configuration object from JSONC.
 * @param {"monthly"|"annual"} planType - Target plan type.
 * @returns {{ badgeText: string, pricePillsHtml: string }} Discount badge and price breakdown HTML.
 */
function getDiscountDetails(config, planType) {
  const isMonthly = planType === "monthly";
  const periodLabel = isMonthly ? "/mo" : "/yr";

  // Check if discount type is custom prices
  if (config.discountType === "custom_price" && config.customPrices) {
    const proCustom = config.customPrices.pro ? config.customPrices.pro[planType] : null;
    const ultCustom = config.customPrices.ultimate ? config.customPrices.ultimate[planType] : null;

    const proBase = BASE_PRICES.pro[planType];
    const ultBase = BASE_PRICES.ultimate[planType];

    const proDiscount = typeof proCustom === "number" ? calculateDiscountPercentage(proBase, proCustom) : 0;
    const ultDiscount = typeof ultCustom === "number" ? calculateDiscountPercentage(ultBase, ultCustom) : 0;

    let badgeText = "";
    if (proDiscount > 0 && ultDiscount > 0) {
      if (proDiscount === ultDiscount) {
        badgeText = `${proDiscount}% OFF`;
      } else {
        const maxDisc = Math.max(proDiscount, ultDiscount);
        badgeText = `Up to ${maxDisc}% OFF`;
      }
    } else if (proDiscount > 0) {
      badgeText = `${proDiscount}% OFF`;
    } else if (ultDiscount > 0) {
      badgeText = `${ultDiscount}% OFF`;
    }

    // Build price pills breakdown
    let pricePillsHtml = "";
    const pills = [];

    if (typeof proCustom === "number" && proDiscount > 0) {
      pills.push(`
        <span class="promo-plan-price-tag">
          <strong>Pro:</strong> <s>€${proBase.toFixed(2)}</s> €${proCustom.toFixed(2)}${periodLabel}
          <span class="promo-percent-badge">-${proDiscount}%</span>
        </span>
      `);
    }

    if (typeof ultCustom === "number" && ultDiscount > 0) {
      pills.push(`
        <span class="promo-plan-price-tag">
          <strong>Ultimate:</strong> <s>€${ultBase.toFixed(2)}</s> €${ultCustom.toFixed(2)}${periodLabel}
          <span class="promo-percent-badge">-${ultDiscount}%</span>
        </span>
      `);
    }

    if (pills.length > 0) {
      pricePillsHtml = `<div class="promo-price-pills">${pills.join("")}</div>`;
    }

    // Override badge if user specified a manual string other than "auto" or ""
    if (config.discountHighlight && config.discountHighlight !== "auto" && config.discountHighlight.trim() !== "") {
      badgeText = config.discountHighlight;
    }

    return { badgeText, pricePillsHtml };
  }

  // Fixed percentage mode
  if (config.discountType === "percentage" || typeof config.discountPercentage === "number") {
    const pct = Math.round(config.discountPercentage || 0);
    const badgeText = (config.discountHighlight && config.discountHighlight !== "auto")
      ? config.discountHighlight
      : (pct > 0 ? `${pct}% OFF` : "");
    return { badgeText, pricePillsHtml: "" };
  }

  // Fallback to manual discountHighlight
  const badgeText = (config.discountHighlight && config.discountHighlight !== "auto")
    ? config.discountHighlight
    : "";
  return { badgeText, pricePillsHtml: "" };
}

/**
 * Renders the promotional banner into a specific DOM container.
 * 
 * @param {Object} config - Configuration object parsed from JSONC.
 * @param {string} containerId - Target element ID (e.g. "monthlyPromoBannerContainer").
 * @param {"monthly"|"annual"} planType - Target plan type.
 */
function renderBannerForTab(config, containerId, planType) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Determine if this planType is allowed by config.applyTo
  const applyTo = (config.applyTo || "both").toLowerCase();
  const isApplicable =
    applyTo === "both" ||
    (applyTo === "monthly" && planType === "monthly") ||
    (applyTo === "annual" && planType === "annual");

  // Check if promo is globally active, in valid date range, and applicable to this tab
  if (!config || !config.active || !isApplicable || !isPromoDateActive(config.startDate, config.endDate)) {
    container.innerHTML = "";
    container.style.display = "none";
    return;
  }

  const { badgeText, pricePillsHtml } = getDiscountDetails(config, planType);

  const badgeHtml = config.badge
    ? `<span class="promo-badge"><i class="bi bi-tag-fill me-1"></i>${config.badge}</span>`
    : "";

  const discountHtml = badgeText
    ? `<span class="promo-discount-badge ms-2">${badgeText}</span>`
    : "";

  const code = config.couponCode || "";
  const collapseId = `promoInstructions_${planType}`;

  // Build steps list if howToApply is specified
  let stepsHtml = "";
  if (config.howToApply && Array.isArray(config.howToApply.steps) && config.howToApply.steps.length > 0) {
    stepsHtml = config.howToApply.steps
      .map(
        (step, index) => `
          <div class="promo-step-item">
            <span class="promo-step-number">${index + 1}</span>
            <span class="promo-step-text">${step}</span>
          </div>
        `
      )
      .join("");
  }

  const additionalInfoHtml = config.additionalInfo
    ? `<div class="promo-extra-info"><i class="bi bi-info-circle me-1"></i>${config.additionalInfo}</div>`
    : "";

  const instructionsTitle =
    (config.howToApply && config.howToApply.title) || "How to apply this coupon code";

  container.style.display = "block";
  container.innerHTML = `
    <div class="promo-banner">
      <div class="row align-items-center g-3">
        <!-- Left: Badge, Title, Description & Custom Price Pills -->
        <div class="col-lg-8 col-md-7">
          <div class="d-flex align-items-center flex-wrap gap-2 mb-2">
            ${badgeHtml}
            ${discountHtml}
          </div>
          <h3 class="promo-title">${config.title || "Special Promotion"}</h3>
          <p class="promo-description mb-0">
            ${config.description || ""}
          </p>
          ${pricePillsHtml}
        </div>

        <!-- Right: Coupon Code Box & Copy Action -->
        <div class="col-lg-4 col-md-5">
          <div class="promo-code-card">
            <div>
              <div class="promo-code-label">PROMO CODE</div>
              <div class="promo-code-val">${code}</div>
            </div>
            <button
              class="promo-copy-btn"
              type="button"
              onclick="copyPromoCode('${code}', this)"
              title="Copy coupon code"
            >
              <i class="bi bi-clipboard me-1"></i>
              <span>Copy</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Instructions Accordion / Collapse -->
      ${
        stepsHtml
          ? `
        <div class="promo-accordion-wrapper mt-3 pt-3">
          <button
            class="promo-how-to-toggle"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#${collapseId}"
            aria-expanded="false"
            aria-controls="${collapseId}"
            onclick="togglePromoInstructions('${collapseId}', this)"
          >
            <i class="bi bi-question-circle"></i>
            <span>${instructionsTitle}</span>
            <i class="bi bi-chevron-down promo-chevron ms-1"></i>
          </button>
          <div class="collapse" id="${collapseId}">
            <div class="promo-instructions-body">
              <div class="promo-steps-list">
                ${stepsHtml}
              </div>
              ${additionalInfoHtml}
            </div>
          </div>
        </div>
      `
          : ""
      }
    </div>
  `;
}

/**
 * Target definitions for the pricing cards on the page.
 */
const PRICING_TARGETS = [
  {
    containerId: "price_container_pro_monthly",
    plan: "pro",
    term: "monthly",
    basePrice: 2.99,
    suffix: "/month"
  },
  {
    containerId: "price_container_ultimate_monthly",
    plan: "ultimate",
    term: "monthly",
    basePrice: 5.99,
    suffix: "/month"
  },
  {
    containerId: "price_container_pro_annual",
    plan: "pro",
    term: "annual",
    basePrice: 24.90,
    suffix: "/year"
  },
  {
    containerId: "price_container_ultimate_annual",
    plan: "ultimate",
    term: "annual",
    basePrice: 49.90,
    suffix: "/year"
  }
];

/**
 * Updates the price displays on all pricing cards:
 * If a promotion is active for the target plan/term, strikes through the original price
 * and displays the discounted price next to it.
 * If the promotion is inactive or not applicable, restores the standard original price.
 * 
 * @param {Object|null} config - Configuration object parsed from JSONC.
 */
function updateCardPrices(config) {
  const isGloballyActive =
    Boolean(config &&
    config.active &&
    isPromoDateActive(config.startDate, config.endDate));

  const applyTo = (config?.applyTo || "both").toLowerCase();

  PRICING_TARGETS.forEach((target) => {
    const container = document.getElementById(target.containerId);
    if (!container) return;

    const isTermApplicable =
      isGloballyActive &&
      (applyTo === "both" || applyTo === target.term);

    let discountedPrice = null;

    if (isTermApplicable && config) {
      if (config.discountType === "custom_price" && config.customPrices) {
        const custom = config.customPrices[target.plan]?.[target.term];
        if (typeof custom === "number" && custom < target.basePrice) {
          discountedPrice = custom;
        }
      } else if (config.discountType === "percentage" || typeof config.discountPercentage === "number") {
        const pct = Math.round(config.discountPercentage || 0);
        if (pct > 0 && pct < 100) {
          discountedPrice = target.basePrice * (1 - pct / 100);
        }
      }
    }

    if (discountedPrice !== null) {
      // Format original and discounted prices
      const origFormatted = `€${target.basePrice.toFixed(2)}`;
      const discFormatted = `€${discountedPrice.toFixed(2)}`;

      container.innerHTML = `
        <span class="original-crossed-price" title="Original price: ${origFormatted}">${origFormatted}</span>
        <span class="price">${discFormatted}</span>
        <span class="text-muted">${target.suffix}</span>
      `;
    } else {
      // Standard regular price
      container.innerHTML = `
        <span class="price">€${target.basePrice.toFixed(2)}</span>
        <span class="text-muted">${target.suffix}</span>
      `;
    }
  });
}

/**
 * Loads JSONC configuration and initializes the promotional banners.
 */
async function initPromoBanner() {
  let promoData = null;

  try {
    const response = await fetch("assets/data/promo.jsonc");
    if (response.ok) {
      const rawText = await response.text();
      const sanitizedJson = stripJsonComments(rawText);
      promoData = JSON.parse(sanitizedJson);
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (err) {
    console.warn("[PromoBanner] Could not load assets/data/promo.jsonc:", err);
    updateCardPrices(null);
    return;
  }

  // Update card prices (strike-through original price and show discounted price)
  updateCardPrices(promoData);

  // Render to Monthly container
  renderBannerForTab(promoData, "monthlyPromoBannerContainer", "monthly");

  // Render to Annual container
  renderBannerForTab(promoData, "annualPromoBannerContainer", "annual");

  // Refresh AOS if available
  if (window.AOS && typeof window.AOS.refresh === "function") {
    window.AOS.refresh();
  }
}

// Expose globally for inline onclick handlers
window.copyPromoCode = copyPromoCode;
window.togglePromoInstructions = togglePromoInstructions;
window.initPromoBanner = initPromoBanner;

// Initialize on DOM load or immediately if DOM is already ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPromoBanner);
} else {
  initPromoBanner();
}
