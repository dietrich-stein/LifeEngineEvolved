import path from 'path';
import webpack from 'webpack';

type argv = { mode: 'development' | 'production' };

const config = (_env: any, argv: argv):webpack.Configuration => ({
  mode: argv.mode,
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/js/'),
  },
  // devtool: "source-map", // Enable sourcemaps for debugging webpack's output.
  resolve: {
    extensions: [
      ".ts",
    ],
  },
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      { test: /\.tsx?$/, loader: "ts-loader" },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      // { test: /\.js$/, loader: "source-map-loader" },
    ],
  },  
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
    }),
  ],
  devtool: argv.mode === 'production' ? undefined : 'eval-source-map',
});

export default config;
