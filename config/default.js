// default
module.exports = {
    // 程序启动要监听端口号
    port: 3000,
    // express-session 的配置信息
    session: {
        secret: 'myblog',
        key: 'myblog',
        maxAge: 2592000000
    },
    // mongoDB 的地址，blog 为 DB 名
    mongodb: 'mongodb://localhost:27017/blog'
};