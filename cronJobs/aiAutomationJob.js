const cron = require("node-cron");
const AIAutomation = require("../services/AIAutomation");

// Har kuni soat 00:00 da avtomatik jarayonni ishga tushurish
cron.schedule("0 0 * * *", async () => {
  console.log("Running AI automation...");
  await AIAutomation.run();
});