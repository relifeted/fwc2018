const Dotenv = require('dotenv-webpack')
// const WebpackBar = require('webpackbar')

module.exports = {
  webpack: (config, options, webpack) => {
    config.plugins.push(new Dotenv())
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    })
    // config.plugins.push(
    //   new WebpackBar({
    //     profile: true,
    //   })
    // )
    return config
  },
}
