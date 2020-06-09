import webpack from "webpack";

import HTMLPlugin from "html-webpack-plugin";
import CSSPlugin from "mini-css-extract-plugin";
import { loader as TypedCSSLoader } from "@nice-labs/typed-css-modules";

const configuration: webpack.Configuration = {
  context: __dirname,
  devtool: "source-map",
  optimization: { splitChunks: { chunks: "all" } },
  resolve: { extensions: [".ts", ".tsx", ".js", ".json"] },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: require.resolve("ts-loader"),
        options: {
          compilerOptions: {
            module: "esnext",
            esModuleInterop: false,
            allowSyntheticDefaultImports: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          CSSPlugin.loader,
          {
            loader: require.resolve("css-loader"),
            options: { sourceMap: true },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          CSSPlugin.loader,
          {
            loader: require.resolve("css-loader"),
            options: {
              sourceMap: true,
              importLoaders: 2,
              modules: true,
              esModule: true,
            },
          },
          {
            loader: TypedCSSLoader,
            options: { mode: "local" },
          },
          require.resolve("sassjs-loader"),
        ],
      },
    ],
  },
  devServer: { hot: false, inline: false, https: true },
  plugins: [
    new HTMLPlugin({
      title: "Atorch Console",
      favicon: require.resolve("./assets/ammeter.png"),
    }),
    new CSSPlugin({ filename: "[name].css" }),
  ],
  stats: "minimal",
};

export default configuration;
