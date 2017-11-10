var { User } = require('../lib/mongo');

module.exports = {
    // 注册用户
    create: function(user) {
        return User.create(user).exec();
    },
    // 根据用户名获取用户信息
    getUserByName: function(name) {
        return User.findOne({ name: name }).addCreatedAt().exec();
    }
};