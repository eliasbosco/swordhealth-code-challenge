const crypto = require("crypto");

class Crypto {
  /**
   * Get SHA256 hash hex string
   * @param input {string}
   * @returns {string}
   */
  static getSHA256(input) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(input))
      .digest("hex");
  }
}

module.exports = Crypto;