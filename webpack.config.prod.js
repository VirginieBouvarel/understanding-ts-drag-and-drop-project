const path = require('path');
const CleanPlugin = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/app.ts',
  devServer: {
    static: [{ directory: path.join(__dirname)}]
  },
  output: {
    filename: 'bundle.js', 
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
  },
  module: {
    rules: [
      {
        test: /\.ts$/, 
        use: 'ts-loader',
        exclude: /node-modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    // Pour dire à webpack de nettoyer le dossier dist/ avant d'y inscrire un nouveau build
    new CleanPlugin.CleanWebpackPlugin(),
  ]
};