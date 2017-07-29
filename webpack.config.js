var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const env  = require('yargs').argv.env; // use --env with webpack 2

const libraryName = 'GetSheetDone';

let plugins = [];

let outputFile;
if (env === 'build') {
  outputFile = libraryName + '.min.js';
  plugins.push(new UglifyJsPlugin({ minimize: true }));
} else {
  outputFile = libraryName + '.js';
  plugins.push(new HtmlWebpackPlugin({
    template: path.resolve('example', 'index.tpl.html'),
    filename: 'index.html',
    inject: false
  }))
}

let loaders = [
  {
    "test": /\.jsx?$/,
    "exclude": /node_modules/,
    "loader": "babel-loader",
    "query": {
      "presets": [
        "babel-preset-es2015"
      ],
      "plugins": []
    }
  }
];

module.exports = {
  devtool: 'source-map',
  entry: path.resolve('src', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: outputFile,
    library: [libraryName],
    libraryTarget: 'umd',
    umdNamedDefine: true,
    publicPath: '/example',
    libraryExport: 'default'
  },
  externals: {
    "fetch-jsonp": {
      commonjs: "fetch-jsonp",
      commonjs2: "fetch-jsonp",
      amd: "fetch-jsonp",
      root: "fetchJsonp"
    }
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  plugins: plugins,
  module: {
    loaders: loaders
  },
  devServer: {
    contentBase: path.join(__dirname, "example"),
    publicPath: "/js/"
  },
};
