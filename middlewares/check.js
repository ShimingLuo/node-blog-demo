module.exports = {
    checkLogin: function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登录');
            return res.redirect('/signin');
        }
        next();
    },

    checkNotLogin: function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', '已登录');
            console.log(req.get('Referrer'));
            return req.get('Referrer') ? res.redirect('back') : res.redirect('/posts'); //返回之前的页面
        }
        next();
    }
};