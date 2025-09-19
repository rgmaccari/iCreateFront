const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const os = require("os");
const { FileStore } = require("metro-cache");

const projectRoot = __dirname;

// Pasta de cache fora do OneDrive
const cacheRoot = path.join(os.tmpdir(), "iMusician-metro-cache");

const config = getDefaultConfig(projectRoot);

config.resetCache = true; // força limpeza de cache a cada start

config.watchFolders = [projectRoot];

config.transformer = {
    ...config.transformer,
    enableBabelRCLookup: true, // lê .babelrc
    enableBabelRuntime: true,
};

config.cacheStores = [
    new FileStore({ root: cacheRoot })
];

module.exports = config;
