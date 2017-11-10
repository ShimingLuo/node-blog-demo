// signin
var express = require('express');
var sha1 = require('sha1'); // 密码加密

var UserModel = require('../models/users');
var { checkNotLogin } = require('../middlewares/check');

var router = express.Router();

// GET /signin 登录页
router.get('/', checkNotLogin, function(req, res, next) {
    res.render('signin');
});

// POST /signin 用户登录
router.post('/', checkNotLogin, function(req, res, next) {
    //
    let name = req.fields.username,
        password = req.fields.password;
    try {
        UserModel.getUserByName(name).then(function(user) {
            if (!user) {
                req.flash('error', '用户不存在');
                return res.redirect('back');
            }
            if (sha1(password) !== user.password) {
                req.flash('error', "用户名或密码错误");
                return res.redirect('back');
            }
            req.flash('success', "登陆成功");
            // 用户信息写入 session
            delete user.password;
            req.session.user = user;
            res.redirect('/posts');
        }).catch(function(e) {
            next(e);
        });
    } catch (e) {
        next(e);
    }
});

module.exports = router;