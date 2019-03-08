var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
    NODE_ENV: '"development"',
    EVN_CONFIG: '"dev"',
    BASE_URL: '"/api"',
    //   BASE_URL:'"http://localhost:9000/"',
})