const nodeLibs = require('node-libs-browser');
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        filename: 'main.js', 
        path: path.resolve(__dirname, 'dist'), 
      },

    plugins: [
        new webpack.IgnorePlugin({
            resourceRegExp: /i18n-express/,
            contextRegExp: /node_modules/
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html', 
          }),

        ],
    resolve: {
        fallback: {
        "process": require.resolve("process/browser"),

        fs: require.resolve('browserify-fs'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url'),
        buffer: require.resolve('buffer'),
        crypto: require.resolve('crypto-browserify'),
        tls: require.resolve('tls-browserify'),
        net: require.resolve('net-browserify'),
        zlib: require.resolve('browserify-zlib'),
        querystring: require.resolve('querystring-es3'),
        vm: require.resolve('vm-browserify'),
        async_hooks: require.resolve('async-hooks'),
        }
    },
    node: {
        process: false, 
      },
    
};
