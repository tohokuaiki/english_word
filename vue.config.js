const path = require('path')

module.exports = {
    configureWebpack: {
        resolve: {
            alias: {
                '@': path.join(__dirname, '/src')
            }
        }
    },
    pages: {
        index: {
            entry: "src/main.js",
            title: "英単語をタイプで覚えるツール",
        }
    }
}
