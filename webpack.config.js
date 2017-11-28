const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require("webpack");
const path = require('path');


module.exports = {
    entry: {map:'./src/map.js', all:"./src/app.js"},
    output: {
        filename: 'bundle-[name].js',
        path: __dirname + '/build',
        library: "app"
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader"
            })
        }, {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [{
                    loader: "css-loader",
                    options: {
                        sourceMap: true
                    }
                }, {
                    loader: "sass-loader",
                    options: {
                        sourceMap: true
                    }
                }]
            })
        }, {
            test: /\.hbs$/,
            loader: 'handlebars-loader'
        }, ],
    },
    resolve: {
        modules: [
            "src",
            "node_modules"
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.hbs'
        }),
        new HtmlWebpackPlugin({
            template: 'src/about.hbs',
            filename: 'about/index.html',
            excludeChunks: ["map"]
        }),
        new ExtractTextPlugin("styles.css"),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default'],
        })
    ],
    devtool: "source-map"
}