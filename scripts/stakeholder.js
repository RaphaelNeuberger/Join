/**
 * @fileoverview Stakeholder landing page logic. Reads the daily AI request
 *               counter from Firebase RTDB and switches the UI between the
 *               under-limit and limit-reached states (Figma: "Stakeholder" and
 *               "Stakeholder _limit reached").
 * @module stakeholder
 */

/** @constant {number} Maximum AI-processed requests per day */
const DAILY_REQUEST_LIMIT = 10;

/**
 * Returns the current date as YYYY-MM-DD in UTC. n8n uses the same format
 * server-side so both sides read and write the same Firebase node.
 * @returns {string} Date key like "2026-05-27"
 */
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Builds the Firebase REST URL for the current day's rate-limit node.
 * @returns {string} URL of /rateLimits/{today}.json
 * @throws {Error} If the Firebase config is missing
 */
function getRateLimitUrl() {
  const baseUrl = window.firebaseConfig && window.firebaseConfig.databaseURL;
  if (!baseUrl) {
    throw new Error("firebaseConfig.databaseURL is not configured");
  }
  return `${baseUrl}/rateLimits/${getTodayKey()}.json`;
}

/**
 * Fetches today's request count from Firebase. Returns 0 if the node does not
 * exist yet (no requests today) or if the request fails, so the page always
 * stays usable.
 * @async
 * @returns {Promise<number>} Today's count, clamped to 0..DAILY_REQUEST_LIMIT
 */
async function fetchTodaysCount() {
  try {
    const response = await fetch(getRateLimitUrl(), { cache: "no-store" });
    if (!response.ok) return 0;
    const data = await response.json();
    const count = Number(data && data.count);
    if (!Number.isFinite(count) || count < 0) return 0;
    return Math.min(Math.floor(count), DAILY_REQUEST_LIMIT);
  } catch (_error) {
    return 0;
  }
}

/**
 * Applies the count to the UI: updates every counter (desktop header and
 * mobile title area), its colour state and which content section is visible.
 * @param {number} count - Today's request count
 */
function applyCounterState(count) {
  const limitReached = count >= DAILY_REQUEST_LIMIT;

  document.querySelectorAll("[data-counter-used]").forEach((el) => {
    el.textContent = String(count);
  });
  document.querySelectorAll("[data-counter]").forEach((el) => {
    el.dataset.state = limitReached ? "limit" : "under";
  });

  const stateUnder = document.getElementById("stateUnder");
  const stateLimit = document.getElementById("stateLimit");
  if (stateUnder) stateUnder.hidden = limitReached;
  if (stateLimit) stateLimit.hidden = !limitReached;
}

/**
 * Initializes the page once the DOM is ready.
 * @async
 */
async function initStakeholderPage() {
  applyCounterState(await fetchTodaysCount());
}

document.addEventListener("DOMContentLoaded", initStakeholderPage);
