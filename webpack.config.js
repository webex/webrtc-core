const path = require('path')

module.exports = {
    devtool: 'eval-source-map', // for development 
    entry: './src/index.ts',
    mode: 'development',
    watch: true,
    module: {
        rules: [
            {
                test:/\.ts$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname, 'src')]
            }
        ]
    },
    resolve:{
        extensions: ['.ts','.js']
    },
    output : {
        publicPath:'build',
        filename: 'build.js',
        path:path.resolve(__dirname, 'build')
    }
}