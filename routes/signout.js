// signout
var express = require('express');
var router = express.Router();

// GET /signout 登出
router.get('/', function(req, res, next) {
    // 清空 session 中用户信息
    req.session.user = null;
    req.flash('success', '登出成功');
    res.redirect('/posts');
});

module.exports = router;