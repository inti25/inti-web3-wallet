import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});


export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    fallback: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "crypto": require.resolve("crypto-browserify"),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "stream": require.resolve("stream-browserify"),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "assert": require.resolve("assert"),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "http": require.resolve("stream-http"),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "https": require.resolve("https-browserify"),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "os": require.resolve("os-browserify"),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "buffer": require.resolve('buffer'),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "url": require.resolve("url"),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "vm": require.resolve("vm-browserify"),
    },
  },
};
