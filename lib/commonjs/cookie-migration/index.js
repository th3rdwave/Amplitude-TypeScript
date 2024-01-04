"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseTime = exports.parseOldCookies = exports.decode = void 0;
var _analyticsClientCommon = require("@amplitude/analytics-client-common");
var _config = require("../config");
const parseOldCookies = async (apiKey, options) => {
  const storage = await (0, _config.createCookieStorage)({
    ...options,
    domain: options !== null && options !== void 0 && options.disableCookies ? '' : (options === null || options === void 0 ? void 0 : options.domain) ?? (await (0, _config.getTopLevelDomain)())
  });
  const oldCookieName = (0, _analyticsClientCommon.getOldCookieName)(apiKey);
  const cookies = await storage.getRaw(oldCookieName);
  if (!cookies) {
    return {
      optOut: false
    };
  }
  if ((options === null || options === void 0 ? void 0 : options.cookieUpgrade) ?? (0, _config.getDefaultConfig)().cookieUpgrade) {
    await storage.remove(oldCookieName);
  }
  const [deviceId, userId, optOut, sessionId, lastEventTime] = cookies.split('.');
  return {
    deviceId,
    userId: decode(userId),
    sessionId: parseTime(sessionId),
    lastEventTime: parseTime(lastEventTime),
    optOut: Boolean(optOut)
  };
};
exports.parseOldCookies = parseOldCookies;
const parseTime = num => {
  const integer = parseInt(num, 32);
  if (isNaN(integer)) {
    return undefined;
  }
  return integer;
};
exports.parseTime = parseTime;
const decode = value => {
  if (!atob || !escape || !value) {
    return undefined;
  }
  try {
    return decodeURIComponent(escape(atob(value)));
  } catch {
    return undefined;
  }
};
exports.decode = decode;
//# sourceMappingURL=index.js.map