const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require("webpack");
const path = require('path');

module.exports = {
    entry: {map:'map.js', all:"app.js", courses:"courses.js"},
    output: {
        filename: 'bundle-[name].js',
        path: __dirname + '/build',
        library: "app",
        publicPath: "/uw-coursemap/"
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
            baseurl: "/uw-coursemap/",            
            template: 'src/index.hbs',
            chunks: ["all", "map"]
        }),
        new HtmlWebpackPlugin({
            baseurl: "/uw-coursemap/",
            template: 'src/about.hbs',
            filename: 'about/index.html',
            chunks: ["all"]
        }),
        new HtmlWebpackPlugin({
            baseurl: "/uw-coursemap/",
            template: 'src/courses.hbs',
            filename: 'courses/index.html',
            chunks: ["all", "courses"]
        }),
        new ExtractTextPlugin("styles.css"),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default'],
        })
    ],
    devtool: "source-map",
    devServer: {
        contentBase: "build/",
        publicPath: "http://localhost:8080/uw-coursemap/",
        /*
        * Workaround from 
        * https://github.com/webpack/webpack-dev-server/issues/954
        */
        proxy: {
            '/uw-coursemap/data': {
              target: 'http://localhost:8080/',
              pathRewrite: { '^/uw-coursemap/data': '/data' },
            },
        }
    }
}