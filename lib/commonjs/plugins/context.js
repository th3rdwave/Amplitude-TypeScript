"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Context = void 0;
var _uaParserJs = _interopRequireDefault(require("@amplitude/ua-parser-js"));
var _analyticsCore = require("@amplitude/analytics-core");
var _analyticsClientCommon = require("@amplitude/analytics-client-common");
var _version = require("../version");
var _reactNative = require("react-native");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const BROWSER_PLATFORM = 'Web';
const IP_ADDRESS = '$remote';
class Context {
  name = '@amplitude/plugin-context-react-native';
  type = 'before';

  // this.config is defined in setup() which will always be called first
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  nativeModule = _reactNative.NativeModules.AmplitudeReactNative;
  library = `amplitude-react-native-ts/${_version.VERSION}`;
  constructor() {
    let agent;
    /* istanbul ignore else */
    if (typeof navigator !== 'undefined') {
      agent = navigator.userAgent;
    }
    this.uaResult = new _uaParserJs.default(agent).getResult();
  }
  setup(config) {
    this.config = config;
    return Promise.resolve(undefined);
  }
  async execute(context) {
    var _this$nativeModule;
    const time = new Date().getTime();
    const nativeContext = await ((_this$nativeModule = this.nativeModule) === null || _this$nativeModule === void 0 ? void 0 : _this$nativeModule.getApplicationContext(this.config.trackingOptions));
    const appVersion = (nativeContext === null || nativeContext === void 0 ? void 0 : nativeContext.version) || this.config.appVersion;
    const platform = (nativeContext === null || nativeContext === void 0 ? void 0 : nativeContext.platform) || BROWSER_PLATFORM;
    const osName = (nativeContext === null || nativeContext === void 0 ? void 0 : nativeContext.osName) || this.uaResult.browser.name;
    const osVersion = (nativeContext === null || nativeContext === void 0 ? void 0 : nativeContext.osVersion) || this.uaResult.browser.version;
    const deviceVendor = (nativeContext === null || nativeContext === void 0 ? void 0 : nativeContext.deviceManufacturer) || this.uaResult.device.vendor;
    const deviceModel = (nativeContext === null || nativeContext === void 0 ? void 0 : nativeContext.deviceModel) || this.uaResult.device.model || this.uaResult.os.name;
    const language = (nativeContext === null || nativeContext === void 0 ? void 0 : nativeContext.language) || (0, _analyticsClientCommon.getLanguage)();
    const carrier = nativeContext === null || nativeContext === void 0 ? void 0 : nativeContext.carrier;
    const adid = nativeContext === null || nativeContext === void 0 ? void 0 : nativeContext.adid;
    const appSetId = nativeContext === null || nativeContext === void 0 ? void 0 : nativeContext.appSetId;
    const idfv = nativeContext === null || nativeContext === void 0 ? void 0 : nativeContext.idfv;
    const event = {
      user_id: this.config.userId,
      device_id: this.config.deviceId,
      session_id: this.config.sessionId,
      time,
      app_version: appVersion,
      ...(this.config.trackingOptions.platform && {
        platform: platform
      }),
      ...(this.config.trackingOptions.osName && {
        os_name: osName
      }),
      ...(this.config.trackingOptions.osVersion && {
        os_version: osVersion
      }),
      ...(this.config.trackingOptions.deviceManufacturer && {
        device_manufacturer: deviceVendor
      }),
      ...(this.config.trackingOptions.deviceModel && {
        device_model: deviceModel
      }),
      ...(this.config.trackingOptions.language && {
        language: language
      }),
      ...(this.config.trackingOptions.carrier && {
        carrier: carrier
      }),
      ...(this.config.trackingOptions.ipAddress && {
        ip: IP_ADDRESS
      }),
      ...(this.config.trackingOptions.adid && {
        adid: adid
      }),
      ...(this.config.trackingOptions.appSetId && {
        android_app_set_id: appSetId
      }),
      ...(this.config.trackingOptions.idfv && {
        idfv: idfv
      }),
      insert_id: (0, _analyticsCore.UUID)(),
      partner_id: this.config.partnerId,
      plan: this.config.plan,
      ...(this.config.ingestionMetadata && {
        ingestion_metadata: {
          source_name: this.config.ingestionMetadata.sourceName,
          source_version: this.config.ingestionMetadata.sourceVersion
        }
      }),
      ...context,
      library: this.library
    };
    return event;
  }
}
exports.Context = Context;
//# sourceMappingURL=context.js.map