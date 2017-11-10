// signup
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');

var UserModel = require('../models/users');
var { checkNotLogin } = require('../middlewares/check');

// GET /signup 注册页
router.get('/', checkNotLogin, function(req, res, next) {
    res.render('signup');
});

// POST /signup 用户注册
router.post('/', checkNotLogin, function(req, res, next) {
    let name = req.fields.username,
        gender = req.fields.gender,
        bio = req.fields.bio,
        avatar = req.files.avatar,
        password = req.fields.password,
        repassword = req.fields.repassword;

    // 参数严重
    try {
        if (!(name.length >= 1 && name.length <= 10)) {
            throw new Error('名字请限制在 1-10 个字符');
        }
        if (['m', 'f', 'x'].indexOf(gender) === -1) {
            throw new Error('性别只能是 m、f 或 x');
        }
        if (!(bio.length >= 1 && bio.length <= 30)) {
            throw new Error('个人简介请限制在 1-30 个字符');
        }
        if (password.length < 3) {
            throw new Error('密码至少 6 个字符');
        }
        if (password !== repassword) {
            throw new Error('两次输入密码不一致');
        }
    } catch (e) {
        // 删除头像文件
        if (avatar) {
            fs.unlink(avatar.path);
        }
        req.flash('error', e.message);
        return res.redirect('/signup');
        // return res.end(e.message);
    }

    // 加密
    password = sha1(password);

    // 待写入数据库 user
    let user = {
        name: name,
        password: password,
        gender: gender,
        bio: bio,
        avatar: avatar ? avatar.path.split(path.sep).pop() : "avatar.jpg"
    };

    UserModel.create(user).then(function(result) {
        // 此 user 是插入 mongodb 后的值，包含 _id
        user = result.ops[0];
        // 将用户信息存入 session
        delete user.password;
        req.session.user = user;
        // 写入flash
        req.flash('success', '注册成功');
        //
        // res.redirect('/signin');
        res.redirect('/posts');
    }).catch(function(e) {
        // 删除头像文件
        if (avatar) {
            fs.unlink(avatar.path);
        }
        // 用户名被占用则跳回注册页，而不是错误页
        if (e.message.match('E11000 duplicate key')) {
            req.flash('error', '用户名已被占用');
            return res.redirect('/signup');
        }
        next(e);
    });

});

module.exports = router;