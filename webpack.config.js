const path = require("path");
const autoprefixer = require("autoprefixer");
const jsonToSass = require("jsontosass");
const CopyPlugin = require("copy-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const { getPublishedComponents } = require("./src/published-components");

module.exports = options => {
  const IS_DEV = process.env.NODE_ENV === "development";
  const nodeExternals = require("webpack-node-externals");
  const styleLoaders = [
    IS_DEV || options.storybook
      ? {
          loader: "style-loader",
          options: {
            injectType: "singletonStyleTag"
          }
        }
      : {
          loader: MiniCssExtractPlugin.loader,
          options: {
            // you can specify a publicPath here
            // by default it uses publicPath in webpackOptions.output
            hmr: false
          }
        },
    {
      loader: "css-loader",
      options: {
        modules: {
          mode: "local",
          auto: true,
          localIdentName: "[path][name]__[local]--[hash:base64:5]",
          context: path.resolve(__dirname, "src"),
          exportGlobals: false
        }
      }
    },
    {
      loader: "postcss-loader",
      options: {
        plugins: () => [autoprefixer() /* Using browsers from .browserslistrc file */]
      }
    }
  ];
  const devtool = options.storybook ? "eval-cheap-module-source-map" : false;

  return {
    devtool,
    resolve: {
      modules: [__dirname, "node_modules"],
      extensions: [".js", ".jsx"]
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ["babel-loader", "eslint-loader"]
        },
        {
          test: /\.scss$/,
          use: [
            ...styleLoaders,
            {
              loader: "fast-sass-loader",
              options: {
                includePaths: [path.resolve("./src")],
                transformers: [
                  {
                    extensions: [".json"],
                    transform: rawFile => jsonToSass.convert(rawFile)
                  }
                ]
              }
            }
          ]
        },
        {
          test: /\.css$/,
          include: [path.resolve(__dirname, "not_exist_path")],
          use: styleLoaders
        }
      ]
    },
    externals: [nodeExternals()],
    entry: {
      main: path.join(__dirname, "/src/index.js"),
      ...getPublishedComponents(__dirname)
    },
    output: {
      path: path.join(__dirname, "/dist/"),
      filename: "[name].js",
      library: "monday-style",
      libraryTarget: "umd",
      globalObject: "this"
    },
    optimization: {
      minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: "src/constants/colors.json",
            to: "assets/"
          }
        ]
      }),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // all options are optional
        filename: "[name].css",
        chunkFilename: "[name].css",
        ignoreOrder: false // Enable to remove warnings about conflicting order
      })
    ]
  };
};
