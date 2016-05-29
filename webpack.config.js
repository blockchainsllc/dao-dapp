var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var ENV = process.env.NODE_ENV || 'development';
var isProd = ENV === 'production';

module.exports = {
  debug: !isProd,
  cache: !isProd,
  devtool: isProd ? '#source-map' : '#cheap-module-eval-source-map',
  entry: {
    index: './src/index.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: './dist'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      },
      {test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css?sourceMap')},
      {test: /\.html/, loader: 'file?name=[name].html'},
      {test: /\.png/, loader: 'file?name=[name].png'},
      {test: /\.json/, loader: 'json'},
      {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml'}
    ]
  },
  plugins: (function() {
    var plugins = [
      new ExtractTextPlugin('styles.bundle.css')
    ];
    if (isProd) {
      plugins.push(new webpack.optimize.OccurrenceOrderPlugin(false));
      plugins.push(new webpack.optimize.DedupePlugin());
      plugins.push(new webpack.optimize.UglifyJsPlugin({
        mangle: false,
        compress: {
          warnings: false
        }
      }));
    }
    return plugins;
  }())
};
