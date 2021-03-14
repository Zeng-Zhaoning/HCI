module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: "http://localhost:8070",  //'http://47.111.73.158:8090/demo',   //接口域名
                changeOrigin: true,             //是否跨域
                //ws: true,                       //是否代理 websockets
                //secure: false,                   //是否https接口
                pathRewrite: {                  //路径重置
                    '^/api': '/api'
                }
            }
        },
        //下面这段用来实现 修改代码实时刷新浏览器
        open: true,
        port: 8070
    }
};