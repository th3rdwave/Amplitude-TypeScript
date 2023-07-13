import { getGlobalScope } from '@amplitude/analytics-client-common';
import AsyncStorage from '@react-native-async-storage/async-storage';
export class LocalStorage {
  async isEnabled() {
    /* istanbul ignore if */
    if (!getGlobalScope()) {
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
    return (await AsyncStorage.getItem(key)) || undefined;
  }
  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      //
    }
  }
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      //
    }
  }
  async reset() {
    try {
      await AsyncStorage.clear();
    } catch {
      //
    }
  }
}
//# sourceMappingURL=local-storage.js.map