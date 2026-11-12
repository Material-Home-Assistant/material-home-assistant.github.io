/**
 * ==============================================================================
 * Material Home Assistant - Apple-Style Scrollytelling 3D Engine (device-flip.js)
 * ==============================================================================
 *
 * Implements smooth linear-interpolated 3D scroll flipping and story beat
 * cross-fading for the Tablet and Smartphone hardware mockups in a split layout.
 */

(function () {
  "use strict";

  // State variables
  let targetProgress = 0;
  let currentProgress = 0;
  let isTicking = false;

  // DOM Elements cache
  let section = null;
  let tabletFlipper = null;
  let phoneFlipper = null;
  let tabletDevice = null;
  let phoneDevice = null;
  let tabletSheen = null;
  let phoneSheen = null;
  let hudFill = null;
  let hudPrompt = null;
  let beat1 = null;
  let beat2 = null;
  let hudBtn1 = null;
  let hudBtn2 = null;

  // Mouse tilt offsets
  let mouseTiltX = 0;
  let mouseTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  /**
   * Linear interpolation helper.
   */
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  /**
   * Initializes element references once DOM is ready.
   */
  function cacheElements() {
    section = document.getElementById("overview");
    tabletFlipper = document.getElementById("tabletFlipper");
    phoneFlipper = document.getElementById("phoneFlipper");
    tabletDevice = document.getElementById("tabletDevice");
    phoneDevice = document.getElementById("phoneDevice");
    tabletSheen = document.getElementById("tabletSheen");
    phoneSheen = document.getElementById("phoneSheen");
    hudFill = document.getElementById("hudProgressFill");
    hudPrompt = document.getElementById("hudScrollPrompt");
    beat1 = document.getElementById("storyBeat1");
    beat2 = document.getElementById("storyBeat2");
    hudBtn1 = document.getElementById("hudStep1");
    hudBtn2 = document.getElementById("hudStep2");
  }

  /**
   * Calculates normalized scroll progress through the scrolly section (0.0 to 1.0).
   */
  function updateScrollProgress() {
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const totalScrollable = rect.height - windowHeight;

    if (totalScrollable <= 0) return;

    // How many pixels we have scrolled past section top
    const scrolled = -rect.top;
    const rawProgress = scrolled / totalScrollable;

    // Clamp between 0 and 1
    targetProgress = Math.min(1, Math.max(0, rawProgress));

    // Hide or fade scroll prompt once user has started scrolling
    if (hudPrompt) {
      if (targetProgress > 0.05) {
        hudPrompt.style.opacity = "0";
      } else {
        hudPrompt.style.opacity = "1";
      }
    }
  }

  /**
   * Hermite smoothstep interpolation with zero velocity at endpoints.
   */
  function smoothStep(edge0, edge1, x) {
    if (x <= edge0) return 0;
    if (x >= edge1) return 1;
    const t = (x - edge0) / (edge1 - edge0);
    return t * t * (3 - 2 * t);
  }

  /**
   * Main render loop using requestAnimationFrame for buttery 60-120fps motion.
   */
  function renderLoop() {
    // Smoothly interpolate current progress towards target
    currentProgress = lerp(currentProgress, targetProgress, 0.12);

    // Smoothly interpolate mouse tilt
    currentTiltX = lerp(currentTiltX, mouseTiltX, 0.08);
    currentTiltY = lerp(currentTiltY, mouseTiltY, 0.08);

    // Calculate direct 2-state flip with balanced dwell zones:
    // - Progress 0.00 to 0.32: Resting on Default Lovelace UI (0deg)
    // - Progress 0.32 to 0.68: Smooth 3D flip transformation (0deg to 180deg)
    // - Progress 0.68 to 1.00: Resting on Material Home Assistant (180deg)
    const tabletFlipT = smoothStep(0.32, 0.68, currentProgress);
    const baseAngle = tabletFlipT * 180;
    const pitchArc = Math.sin(tabletFlipT * Math.PI) * -12;

    // Apply rotation to Tablet (chassis + screen turns together as one solid physical device)
    if (tabletFlipper) {
      tabletFlipper.style.transform = `rotateY(${baseAngle}deg) rotateX(${pitchArc}deg)`;
    }

    // Smartphone flip starts slightly offset (0.35 to 0.71) for spatial depth
    const phoneFlipT = smoothStep(0.35, 0.71, currentProgress);
    const phoneAngle = phoneFlipT * 180;
    const phonePitch = Math.sin(phoneFlipT * Math.PI) * -14;
    const phoneTiltZ = Math.sin(phoneFlipT * Math.PI) * 4;

    if (phoneFlipper) {
      phoneFlipper.style.transform = `rotateY(${phoneAngle}deg) rotateX(${phonePitch}deg) rotateZ(${phoneTiltZ}deg)`;
    }

    // Toggle active face class at 90deg (edge-on) for fail-safe face visibility
    if (tabletFlipper) {
      tabletFlipper.classList.toggle("is-flipped", tabletFlipT >= 0.5);
    }
    if (phoneFlipper) {
      phoneFlipper.classList.toggle("is-flipped", phoneFlipT >= 0.5);
    }

    // Apply resting 3D perspective and subtle mouse parallax tilt to devices (responsive)
    const isMobileViewport = window.innerWidth <= 768;
    const baseTiltTabletY = isMobileViewport ? -3 : -8;
    const baseTiltTabletX = isMobileViewport ? 2 : 4;
    const baseTiltPhoneY = isMobileViewport ? -3 : -6;
    const baseTiltPhoneX = isMobileViewport ? 1.5 : 3;
    const phoneTranslateZ = isMobileViewport ? 22 : 50;

    if (tabletDevice) {
      tabletDevice.style.transform = `rotateY(${baseTiltTabletY + currentTiltY}deg) rotateX(${baseTiltTabletX + currentTiltX}deg)`;
    }
    if (phoneDevice) {
      phoneDevice.style.transform = `translateZ(${phoneTranslateZ}px) rotateY(${baseTiltPhoneY + currentTiltY * 1.2}deg) rotateX(${baseTiltPhoneX + currentTiltX * 1.2}deg)`;
    }

    // Subtle glass sheen opacity modulation
    if (tabletSheen) {
      tabletSheen.style.opacity = (0.2 + Math.abs(Math.cos(tabletFlipT * Math.PI)) * 0.4).toFixed(2);
    }
    if (phoneSheen) {
      phoneSheen.style.opacity = (0.2 + Math.abs(Math.cos(phoneFlipT * Math.PI)) * 0.4).toFixed(2);
    }

    // Update story beats cross-fading
    updateStoryBeats(currentProgress);

    // Update HUD progress line
    if (hudFill) {
      hudFill.style.width = `${currentProgress * 100}%`;
    }

    requestAnimationFrame(renderLoop);
  }

  /**
   * Updates story beat active classes and HUD step highlights.
   */
  function updateStoryBeats(p) {
    // 2-State Direct Narrative Switch at exact mid-flip point (50% progress)
    const activeIndex = p < 0.50 ? 1 : 2;

    if (beat1) beat1.classList.toggle("active", activeIndex === 1);
    if (beat2) beat2.classList.toggle("active", activeIndex === 2);

    if (hudBtn1) {
      hudBtn1.classList.toggle("active", activeIndex === 1);
      hudBtn1.setAttribute("aria-selected", activeIndex === 1 ? "true" : "false");
    }
    if (hudBtn2) {
      hudBtn2.classList.toggle("active", activeIndex === 2);
      hudBtn2.setAttribute("aria-selected", activeIndex === 2 ? "true" : "false");
    }
  }

  /**
   * Smoothly scrolls to a specific narrative chapter when clicking HUD buttons.
   *
   * @param {number} stepNumber - 1 (Default), 2 (Flip mid), 3 (Material 3 Pro).
   */
  window.scrollToStoryBeat = function (stepNumber) {
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const sectionStart = rect.top + scrollTop;
    const windowHeight = window.innerHeight;
    const totalScrollable = section.offsetHeight - windowHeight;

    // Direct jump between State 1 (Default HA) and State 2 (Material Home Assistant)
    let targetRatio = stepNumber === 1 ? 0.15 : 0.85;

    const targetY = sectionStart + targetRatio * totalScrollable;

    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  };

  /**
   * Tracks mouse movement for subtle 3D parallax tilt.
   */
  function setupParallaxTilt() {
    window.addEventListener(
      "mousemove",
      (e) => {
        if (window.innerWidth < 992) return;

        const halfW = window.innerWidth / 2;
        const halfH = window.innerHeight / 2;

        mouseTiltX = -((e.clientY - halfH) / halfH) * 5; // max 5 deg
        mouseTiltY = ((e.clientX - halfW) / halfW) * 7; // max 7 deg
      },
      { passive: true }
    );
  }

  /**
   * Initializes the scrollytelling engine on DOM load.
   */
  function initScrollytelling() {
    cacheElements();

    window.addEventListener(
      "scroll",
      () => {
        if (!isTicking) {
          window.requestAnimationFrame(() => {
            updateScrollProgress();
            isTicking = false;
          });
          isTicking = true;
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "resize",
      () => {
        updateScrollProgress();
      },
      { passive: true }
    );

    setupParallaxTilt();
    updateScrollProgress();
    requestAnimationFrame(renderLoop);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollytelling);
  } else {
    initScrollytelling();
  }
})();
