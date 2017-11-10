/**
 * author: GavinLuo
 * site: https://gavinluo.cn/
 * date: 2017/10/18 9:24
 */
var gulp = require('gulp'),
    connect = require('gulp-connect'),
    proxy = require('http-proxy-middleware');

gulp.task('connect', function() {
    connect.server({
        livereload: true
    });
});

gulp.task('watch', function () {
    gulp.watch(['./views/**', './public/**']).on('change', function (event) {
        gulp.src('').pipe(connect.reload());
    });
});

gulp.task('default', ['connect', 'watch']);
