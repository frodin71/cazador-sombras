const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/js/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|mp3|wav)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3005,
    hot: true,
    allowedHosts: 'all',
    host: '0.0.0.0',
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws'
    }
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@game': path.resolve(__dirname, 'src/js/game'),
      '@ui': path.resolve(__dirname, 'src/js/ui'),
      '@utils': path.resolve(__dirname, 'src/js/utils'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
  },
};
