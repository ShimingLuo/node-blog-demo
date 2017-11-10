// posts
var express = require('express');
var router = express.Router();

var {checkLogin} = require('../middlewares/check');
var PostModel = require('../models/posts');
var CommentModel = require('../models/comments');

// 主页，文章列表
router.get('/', function (req, res, next) {
    let author = req.query.author;

    PostModel.getPosts(author).then(function (posts) {
        res.render('posts', {
            posts: posts
        });
    }).catch(next);
});
// 发表文章-界面
router.get('/create', checkLogin, function (req, res, next) {
    res.render('create');
});
// 发表文章
router.post('/', checkLogin, function (req, res, next) {
    var author = req.session.user._id;
    var title = req.fields.title;
    var content = req.fields.content;
    // 校验参数
    try {
        if (!title.length) {
            throw new Error('请填写标题');
        }
        if (!content.length) {
            throw new Error('请填写内容');
        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('back');
    }

    var post = {
        author: author,
        title: title,
        content: content,
        pv: 0
    };
    PostModel.create(post).then(function (result) {
        // 此 post 是插入 mongodb 后的值，包含 _id
        post = result.ops[0];
        req.flash('success', '发表成功');
        // 发表成功后跳转到该文章页
        res.redirect(`/posts/${post._id}`);
    }).catch(next);
});


// id 查找一篇文章
router.get('/:postID', function (req, res, next) {
    let postId = req.params.postID;

    Promise.all([
        PostModel.getPostById(postId),// 获取文章信息
        CommentModel.getComments(postId), // 获取该文章所有留言
        PostModel.incPv(postId)// pv 加 1
    ]).then(function (result) {
        let post = result[0];
        let comments = result[1];
        if (!post) {
            throw new Error('该文章不存在');
        }

        res.render('post', {
            post: post,
            comments: comments
        });
    }).catch(next);
});
// GET /posts/:postId/edit 更新文章-页面
router.get('/:postId/edit', checkLogin, function (req, res, next) {
    var postId = req.params.postId;
    var author = req.session.user._id;

    PostModel.getRawPostById(postId).then(function (post) {
        if (!post) {
            throw new Error('该文章不存在');
        }
        if (author.toString() !== post.author._id.toString()) {
            throw new Error('权限不足');
        }
        res.render('edit', {
            post: post
        });
    }).catch(next);
});
// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res, next) {
    var postId = req.params.postId;
    var author = req.session.user._id;
    var title = req.fields.title;
    var content = req.fields.content;

    PostModel.updatePostById(postId, author, {
        title: title,
        content: content
    }).then(function () {
        req.flash('success', '编辑文章成功');
        // 编辑成功后跳转到上一页
        res.redirect(`/posts/${postId}`);
    }).catch(next);
});
// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
    var postId = req.params.postId;
    var author = req.session.user._id;

    PostModel.delPostById(postId, author).then(function () {
        req.flash('success', '删除文章成功');
        // 删除成功后跳转到主页
        res.redirect('/posts');
    }).catch(next);
});


// POST /posts/:postId/comment 创建一条留言
router.post('/:postId/comment', checkLogin, function (req, res, next) {
    const author = req.session.user._id;
    const postId = req.params.postId;
    const content = req.fields.content;
    const comment = {
        author: author,
        postId: postId,
        content: content
    };

    CommentModel.create(comment).then(function () {
        req.flash('success', '留言成功');
        // 留言成功后跳转到上一页
        res.redirect('back')
    }).catch(next)
});
// GET /posts/:postId/comment/:commentId/remove 删除一条留言
router.get('/:postId/comment/:commentId/remove', checkLogin, function (req, res, next) {
    const commentId = req.params.commentId;
    const author = req.session.user._id;

    CommentModel.delCommentById(commentId, author).then(function () {
        req.flash('success', '删除留言成功');
        // 删除成功后跳转到上一页
        res.redirect('back');
    }).catch(next);
});

module.exports = router;