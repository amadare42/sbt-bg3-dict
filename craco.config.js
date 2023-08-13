module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            console.log(webpackConfig.entry);
            for (let plugin of webpackConfig.plugins) {
                if (plugin.constructor.name == "HtmlWebpackPlugin") {
                    plugin.excludeChunks = [/worker.*.js/];
                    console.log(plugin);
                }
            }

            // webpackConfig.module.parser.javascript.worker = [];
            webpackConfig.entry = {
                'main': webpackConfig.entry,
                'worker': './src/worker.js'
            }

            return webpackConfig;
        }
    }
}
