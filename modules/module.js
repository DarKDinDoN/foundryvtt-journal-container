import { JournalContainer } from "./classes/JournalContainer.js";
import { registerSettings } from "./settings.js";
import { logger } from "./shared/helpers.js";

Hooks.on("ready", () => {
  logger("Initializing module");

  // Register settings
  registerSettings();

  new JournalContainer();
});
