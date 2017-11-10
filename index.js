// app
var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash'); // 消息通知

var pkg = require('./package');
var winston = require('winston');
var expressWinston = require('express-winston'); // 日志

// var config = require('./config/default');
var config = require('config-lite')(__dirname); // 默认读取 ./config/default.js
var routes = require('./routes');

var app = express();

// 设置存放模板文件的目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// session中间件
app.use(session({
    // 设置 cookie 中保存 session id 的字段名称
    name: config.session.key,
    // 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    secret: config.session.secret,
    resave: true, // 强制更新 session
    // 设置为 false，强制创建一个 session，即使用户未登录
    saveUninitialized: false,
    cookie: {
        // 过期时间，过期后 cookie 中的 session id 自动删除
        maxAge: config.session.maxAge
    },
    // 将 session 存储到 mongodb
    store: new MongoStore({
        // mongodb 地址
        url: config.mongodb
    })
}));
// flash 中间件，用来显示通知
app.use(flash());

// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
    uploadDir: path.join(__dirname, 'public/img'), // 上传文件目录
    keepExtensions: true // 保留后缀
}));

// 设置模板全局常量
app.locals.blog = {
    title: "就怕你不来",
    description: "....."
};

// 添加模板必需的三个变量
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.info = req.flash('info').toString();
    res.locals.error = req.flash('error').toString();
    next();
});

// 正常请求的日志
app.use(expressWinston.logger({
    transports: [
        new (winston.transports.Console)({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/success.log'
        })
    ]
}));

// 设置默认字符集
app.use(function(req, res, next) {
    res.setHeader('content-type', 'text/html;charset=utf-8');
    next();
});
// 路由
routes(app);

// 错误日志
app.use(expressWinston.errorLogger({
    transports: [
        new (winston.transports.Console)({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/error.log'
        })
    ]
}));

// error page
app.use(function (err, req, res, next) {
    res.render('error', {
        error: err
    });
});

// listen
if (module.parent) {
    // 被 require，则导出 app
    module.exports = app;
} else {
    // 监听端口，启动程序
    app.listen(config.port, function () {
        console.log(`${pkg.name} listening on port ${config.port}`);
    });
}
