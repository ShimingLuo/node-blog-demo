/**
 * author: GavinLuo
 * site: https://gavinluo.cn/
 * date: 2017/11/9 10:38
 */

'use strict';
var marked = require('marked');
var {Post} = require('../lib/mongo');
const CommentModel = require('./comments');

// 添加中间处理插件
Post.plugin('contentToHtml', {
    afterFind: (posts) => posts.map((post) => {
        post.content = marked(post.content);
        return post;
    }),
    afterFindOne: (post) => {
        if (post) {
            post.content = marked(post.content);
        }
        return post;
    }
});

// 给 post 添加留言数 commentsCount
Post.plugin('addCommentsCount', {
    afterFind: function (posts) {
        return Promise.all(posts.map(function (post) {
            return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
                post.commentsCount = commentsCount;
                return post
            })
        }))
    },
    afterFindOne: function (post) {
        if (post) {
            return CommentModel.getCommentsCount(post._id).then(function (count) {
                post.commentsCount = count;
                return post
            })
        }
        return post
    }
});

module.exports = {
    // 文章
    create: (post) => Post.create(post).exec(),
    // 通过ID获取文章
    getPostById: (postID) => Post.findOne({_id: postID}).populate({
        path: 'author',
        model: 'User'
    }).addCreatedAt().addCommentsCount().contentToHtml().exec(),
    // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
    getPosts: (author) => {
        var query = {};
        if (author) {
            query.author = author;
        }
        return Post.find(query).populate({
            path: 'author',
            model: 'User'
        }).sort({_id: -1}).addCreatedAt().contentToHtml().exec();
    },
    // 通过文章 id 给 pv 加 1 --- 量
    incPv: (postId) => Post.update({_id: postId}, {$inc: {pv: 1}}).exec(),

    // 通过文章 id 获取一篇原生文章（编辑文章）
    getRawPostById: function getRawPostById(postId) {
        return Post.findOne({_id: postId}).populate({path: 'author', model: 'User'}).exec();
    },
    // 通过用户 id 和文章 id 更新一篇文章
    updatePostById: function updatePostById(postId, author, data) {
        return Post.update({ author: author, _id: postId }, { $set: data }).exec();
    },
    // 通过用户 id 和文章 id 删除一篇文章
    delPostById: function delPostById(postId, author) {
        return Post.remove({ author: author, _id: postId }).exec().then(function (res) {
            // 文章删除后，再删除该文章下的所有留言
            if (res.result.ok && res.result.n > 0) {
                return CommentModel.delCommentsByPostId(postId);
            }
        });
    }
};
