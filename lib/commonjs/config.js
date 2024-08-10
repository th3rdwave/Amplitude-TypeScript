"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReactNativeConfig = exports.getTopLevelDomain = exports.getDefaultConfig = exports.createEventsStorage = exports.createCookieStorage = exports.ReactNativeConfig = void 0;
var _analyticsCore = require("@amplitude/analytics-core");
var _analyticsClientCommon = require("@amplitude/analytics-client-common");
var _localStorage = require("./storage/local-storage");
const getDefaultConfig = () => {
  const cookieStorage = new _analyticsCore.MemoryStorage();
  const trackingOptions = {
    adid: true,
    carrier: true,
    deviceManufacturer: true,
    deviceModel: true,
    ipAddress: true,
    language: true,
    osName: true,
    osVersion: true,
    platform: true,
    appSetId: true,
    idfv: true
  };
  return {
    cookieExpiration: 365,
    cookieSameSite: 'Lax',
    cookieSecure: false,
    cookieStorage,
    cookieUpgrade: true,
    disableCookies: false,
    domain: '',
    sessionTimeout: 5 * 60 * 1000,
    storageProvider: new _analyticsCore.MemoryStorage(),
    trackingSessionEvents: false,
    trackingOptions,
    transportProvider: new _analyticsClientCommon.FetchTransport()
  };
};
exports.getDefaultConfig = getDefaultConfig;
class ReactNativeConfig extends _analyticsCore.Config {
  // NOTE: These protected properties are used to cache values from async storage

  _optOut = false;
  constructor(apiKey, options) {
    const defaultConfig = getDefaultConfig();
    super({
      flushIntervalMillis: 1000,
      flushMaxRetries: 5,
      flushQueueSize: 30,
      transportProvider: defaultConfig.transportProvider,
      ...options,
      apiKey
    });

    // NOTE: Define `cookieStorage` first to persist user session
    // user session properties expect `cookieStorage` to be defined
    this.cookieStorage = (options === null || options === void 0 ? void 0 : options.cookieStorage) ?? defaultConfig.cookieStorage;
    this.deviceId = options === null || options === void 0 ? void 0 : options.deviceId;
    this.lastEventTime = options === null || options === void 0 ? void 0 : options.lastEventTime;
    this.optOut = Boolean(options === null || options === void 0 ? void 0 : options.optOut);
    this.sessionId = options === null || options === void 0 ? void 0 : options.sessionId;
    this.userId = options === null || options === void 0 ? void 0 : options.userId;
    this.appVersion = options === null || options === void 0 ? void 0 : options.appVersion;
    this.cookieExpiration = (options === null || options === void 0 ? void 0 : options.cookieExpiration) ?? defaultConfig.cookieExpiration;
    this.cookieSameSite = (options === null || options === void 0 ? void 0 : options.cookieSameSite) ?? defaultConfig.cookieSameSite;
    this.cookieSecure = (options === null || options === void 0 ? void 0 : options.cookieSecure) ?? defaultConfig.cookieSecure;
    this.cookieUpgrade = (options === null || options === void 0 ? void 0 : options.cookieUpgrade) ?? defaultConfig.cookieUpgrade;
    this.disableCookies = (options === null || options === void 0 ? void 0 : options.disableCookies) ?? defaultConfig.disableCookies;
    this.domain = (options === null || options === void 0 ? void 0 : options.domain) ?? defaultConfig.domain;
    this.partnerId = options === null || options === void 0 ? void 0 : options.partnerId;
    this.sessionTimeout = (options === null || options === void 0 ? void 0 : options.sessionTimeout) ?? defaultConfig.sessionTimeout;
    this.trackingOptions = (options === null || options === void 0 ? void 0 : options.trackingOptions) ?? defaultConfig.trackingOptions;
    this.trackingSessionEvents = (options === null || options === void 0 ? void 0 : options.trackingSessionEvents) ?? defaultConfig.trackingSessionEvents;
  }
  get deviceId() {
    return this._deviceId;
  }
  set deviceId(deviceId) {
    if (this._deviceId !== deviceId) {
      this._deviceId = deviceId;
      this.updateStorage();
    }
  }
  get userId() {
    return this._userId;
  }
  set userId(userId) {
    if (this._userId !== userId) {
      this._userId = userId;
      this.updateStorage();
    }
  }
  get sessionId() {
    return this._sessionId;
  }
  set sessionId(sessionId) {
    if (this._sessionId !== sessionId) {
      this._sessionId = sessionId;
      this.updateStorage();
    }
  }
  get optOut() {
    return this._optOut;
  }
  set optOut(optOut) {
    if (this._optOut !== optOut) {
      this._optOut = optOut;
      this.updateStorage();
    }
  }
  get lastEventTime() {
    return this._lastEventTime;
  }
  set lastEventTime(lastEventTime) {
    if (this._lastEventTime !== lastEventTime) {
      this._lastEventTime = lastEventTime;
      this.updateStorage();
    }
  }
  get lastEventId() {
    return this._lastEventId;
  }
  set lastEventId(lastEventId) {
    if (this._lastEventId !== lastEventId) {
      this._lastEventId = lastEventId;
      this.updateStorage();
    }
  }
  updateStorage() {
    var _this$cookieStorage;
    const cache = {
      deviceId: this._deviceId,
      userId: this._userId,
      sessionId: this._sessionId,
      optOut: this._optOut,
      lastEventTime: this._lastEventTime,
      lastEventId: this._lastEventId
    };
    void ((_this$cookieStorage = this.cookieStorage) === null || _this$cookieStorage === void 0 ? void 0 : _this$cookieStorage.set((0, _analyticsClientCommon.getCookieName)(this.apiKey), cache));
  }
}
exports.ReactNativeConfig = ReactNativeConfig;
const useReactNativeConfig = async (apiKey, options) => {
  var _config$loggerProvide;
  const defaultConfig = getDefaultConfig();

  // create cookie storage
  const domain = options !== null && options !== void 0 && options.disableCookies ? '' : (options === null || options === void 0 ? void 0 : options.domain) ?? (await getTopLevelDomain());
  const cookieStorage = await createCookieStorage({
    ...options,
    domain
  });
  const previousCookies = await cookieStorage.get((0, _analyticsClientCommon.getCookieName)(apiKey));
  const queryParams = (0, _analyticsClientCommon.getQueryParams)();

  // reconcile user session
  const deviceId = (options === null || options === void 0 ? void 0 : options.deviceId) ?? queryParams.deviceId ?? (previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.deviceId) ?? (0, _analyticsCore.UUID)();
  const lastEventTime = (options === null || options === void 0 ? void 0 : options.lastEventTime) ?? (previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.lastEventTime);
  const optOut = (options === null || options === void 0 ? void 0 : options.optOut) ?? Boolean(previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.optOut);
  const sessionId = (options === null || options === void 0 ? void 0 : options.sessionId) ?? (previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.sessionId);
  const userId = (options === null || options === void 0 ? void 0 : options.userId) ?? (previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.userId);
  const config = new ReactNativeConfig(apiKey, {
    ...options,
    cookieStorage,
    deviceId,
    domain,
    lastEventTime,
    optOut,
    sessionId,
    storageProvider: await createEventsStorage(options),
    trackingOptions: {
      ...defaultConfig.trackingOptions,
      ...(options === null || options === void 0 ? void 0 : options.trackingOptions)
    },
    transportProvider: (options === null || options === void 0 ? void 0 : options.transportProvider) ?? new _analyticsClientCommon.FetchTransport(),
    userId
  });
  config.lastEventId = previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.lastEventId;
  (_config$loggerProvide = config.loggerProvider) === null || _config$loggerProvide === void 0 ? void 0 : _config$loggerProvide.log(`Init: storage=${cookieStorage.constructor.name} restoredSessionId = ${(previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.sessionId) ?? 'undefined'}, optionsSessionId = ${(options === null || options === void 0 ? void 0 : options.sessionId) ?? 'undefined'}`);
  return config;
};
exports.useReactNativeConfig = useReactNativeConfig;
const createCookieStorage = async function (overrides) {
  let baseConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getDefaultConfig();
  const options = {
    ...baseConfig,
    ...overrides
  };
  const cookieStorage = overrides === null || overrides === void 0 ? void 0 : overrides.cookieStorage;
  if (!cookieStorage || !(await cookieStorage.isEnabled())) {
    return createFlexibleStorage(options);
  }
  return cookieStorage;
};
exports.createCookieStorage = createCookieStorage;
const createFlexibleStorage = async options => {
  let storage = new _analyticsClientCommon.CookieStorage({
    domain: options.domain,
    expirationDays: options.cookieExpiration,
    sameSite: options.cookieSameSite,
    secure: options.cookieSecure
  });
  if (options.disableCookies || !(await storage.isEnabled())) {
    storage = new _localStorage.LocalStorage();
    if (!(await storage.isEnabled())) {
      storage = new _analyticsCore.MemoryStorage();
    }
  }
  return storage;
};
const createEventsStorage = async overrides => {
  const hasStorageProviderProperty = overrides && Object.prototype.hasOwnProperty.call(overrides, 'storageProvider');
  // If storageProperty is explicitly undefined like `{ storageProperty: undefined }`
  // then storageProvider is undefined
  // If storageProvider is implicitly undefined like `{ }`
  // then storageProvider is LocalStorage
  // Otherwise storageProvider is overriden
  if (!hasStorageProviderProperty || overrides.storageProvider) {
    for (const storage of [overrides === null || overrides === void 0 ? void 0 : overrides.storageProvider, new _localStorage.LocalStorage()]) {
      if (storage && (await storage.isEnabled())) {
        return storage;
      }
    }
  }
  return undefined;
};
exports.createEventsStorage = createEventsStorage;
const getTopLevelDomain = async url => {
  if (!(await new _analyticsClientCommon.CookieStorage().isEnabled()) || !url && (typeof location === 'undefined' || !location.hostname)) {
    return '';
  }
  const host = url ?? location.hostname;
  const parts = host.split('.');
  const levels = [];
  const storageKey = 'AMP_TLDTEST';
  for (let i = parts.length - 2; i >= 0; --i) {
    levels.push(parts.slice(i).join('.'));
  }
  for (let i = 0; i < levels.length; i++) {
    const domain = levels[i];
    const options = {
      domain: '.' + domain
    };
    const storage = new _analyticsClientCommon.CookieStorage(options);
    await storage.set(storageKey, 1);
    const value = await storage.get(storageKey);
    if (value) {
      await storage.remove(storageKey);
      return '.' + domain;
    }
  }
  return '';
};
exports.getTopLevelDomain = getTopLevelDomain;
//# sourceMappingURL=config.js.map