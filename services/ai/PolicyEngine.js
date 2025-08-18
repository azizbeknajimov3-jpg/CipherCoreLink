const fs = require("fs");
const yaml = require("js-yaml");
let cache = null;
const PATH = "config/policy.yaml";

module.exports = {
  load() {
    if (!cache) {
      try {
        cache = yaml.load(fs.readFileSync(PATH, "utf8"));
      } catch (e) {
        console.warn("[PolicyEngine] could not load, using empty", e.message);
        cache = {};
      }
    }
    return cache;
  },
  reload() {
    cache = null;
    return this.load();
  }
};
