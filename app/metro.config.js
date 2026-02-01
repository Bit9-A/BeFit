const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix for "Cannot use 'import.meta' outside a module"
// Forces Metro to prefer CommonJS (require) over ESM (import)
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ["require", "react-native"];

module.exports = withNativeWind(config, { input: "./global.css" });
