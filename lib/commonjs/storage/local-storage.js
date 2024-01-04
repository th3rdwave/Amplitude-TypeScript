"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LocalStorage = void 0;
var _analyticsClientCommon = require("@amplitude/analytics-client-common");
var _asyncStorage = _interopRequireDefault(require("@react-native-async-storage/async-storage"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class LocalStorage {
  async isEnabled() {
    /* istanbul ignore if */
    if (!(0, _analyticsClientCommon.getGlobalScope)()) {
      return false;
    }
    const random = String(Date.now());
    const testStorage = new LocalStorage();
    const testKey = 'AMP_TEST';
    try {
      await testStorage.set(testKey, random);
      const value = await testStorage.get(testKey);
      return value === random;
    } catch {
      /* istanbul ignore next */
      return false;
    } finally {
      await testStorage.remove(testKey);
    }
  }
  async get(key) {
    try {
      const value = await this.getRaw(key);
      if (!value) {
        return undefined;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(value);
    } catch {
      /* istanbul ignore next */
      return undefined;
    }
  }
  async getRaw(key) {
    return (await _asyncStorage.default.getItem(key)) || undefined;
  }
  async set(key, value) {
    try {
      await _asyncStorage.default.setItem(key, JSON.stringify(value));
    } catch {
      //
    }
  }
  async remove(key) {
    try {
      await _asyncStorage.default.removeItem(key);
    } catch {
      //
    }
  }
  async reset() {
    try {
      await _asyncStorage.default.clear();
    } catch {
      //
    }
  }
}
exports.LocalStorage = LocalStorage;
//# sourceMappingURL=local-storage.js.map