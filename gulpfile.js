var gulp = require('gulp');
var del = require('del');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var gutil = require("gulp-util");
var watchify = require("watchify");
var paths = {
    pages: ['index.html']
};

function bundleTs() {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/main.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify);
}

function buildApp() {
    return bundleTs()
    .transform('babelify', {
        presets: ['es2015'],
        extensions: ['.ts']
    })
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build'));
}

var watchApp = watchify(bundleTs());
    

gulp.task('clean:dist', function() {
    del(["dist/**"]);
});
gulp.task('clean:build', function() {
    del(["build/**"]);
});

gulp.task('copy:html', function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest('dist'));
});

gulp.task('copy:html:build', function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest('build'));
});

function _generateBundle() {
    return watchApp
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('dist'));
};

watchApp.on("update", _generateBundle);
    watchApp.on("log", gutil.log);
gulp.task('watch', ['clean:dist', 'copy:html'], function() {
    
    return _generateBundle();
});

gulp.task('build', ['clean:build', 'copy:html:build'], buildApp);

gulp.task('default', ['build']);
