"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Identify", {
  enumerable: true,
  get: function () {
    return _analyticsCore.Identify;
  }
});
Object.defineProperty(exports, "Revenue", {
  enumerable: true,
  get: function () {
    return _analyticsCore.Revenue;
  }
});
exports.add = exports.Types = void 0;
Object.defineProperty(exports, "createInstance", {
  enumerable: true,
  get: function () {
    return _reactNativeClient.createInstance;
  }
});
exports.track = exports.setUserId = exports.setSessionId = exports.setOptOut = exports.setGroup = exports.setDeviceId = exports.revenue = exports.reset = exports.remove = exports.logEvent = exports.init = exports.identify = exports.groupIdentify = exports.getUserId = exports.getSessionId = exports.getDeviceId = exports.flush = void 0;
var _reactNativeClient = _interopRequireWildcard(require("./react-native-client"));
var _analyticsCore = require("@amplitude/analytics-core");
var Types = _interopRequireWildcard(require("@amplitude/analytics-types"));
exports.Types = Types;
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/* eslint-disable @typescript-eslint/unbound-method */

const {
  add,
  flush,
  getDeviceId,
  getSessionId,
  getUserId,
  groupIdentify,
  identify,
  init,
  logEvent,
  remove,
  reset,
  revenue,
  setDeviceId,
  setGroup,
  setOptOut,
  setSessionId,
  setUserId,
  track
} = _reactNativeClient.default;

// Hack - react-native apps have trouble with:
// export * as Types from '@amplitude/analytics-types
exports.track = track;
exports.setUserId = setUserId;
exports.setSessionId = setSessionId;
exports.setOptOut = setOptOut;
exports.setGroup = setGroup;
exports.setDeviceId = setDeviceId;
exports.revenue = revenue;
exports.reset = reset;
exports.remove = remove;
exports.logEvent = logEvent;
exports.init = init;
exports.identify = identify;
exports.groupIdentify = groupIdentify;
exports.getUserId = getUserId;
exports.getSessionId = getSessionId;
exports.getDeviceId = getDeviceId;
exports.flush = flush;
exports.add = add;
//# sourceMappingURL=index.js.map