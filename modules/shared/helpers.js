import { CONSTANTS } from "./constants.js";

/**
 * Preprend logged message with the module title
 * @param {string} msg Message to print
 */
export const logger = (msg) => {
  console.log(`${CONSTANTS.MODULE_TITLE} | ${msg}`);
};

/**
 * Debounce calls before reloading page
 */
export const debouncedReload = foundry.utils.debounce(() => window.location.reload(), 500);
