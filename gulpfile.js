let gulp = require('gulp');
let browserSync = require('browser-sync');
let sass = require('gulp-sass');
let cleanCSS = require('gulp-clean-css');
let rename = require('gulp-rename');
let autoprefixer = require('gulp-autoprefixer');
let babel = require('gulp-babel');
let uglify = require('gulp-uglify');
let plumber = require('gulp-plumber');

const AUTOPREFIXER_BROWSERS = [
    'last 2 versions',
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10',
];

gulp.task('sync',function(){
    browserSync.init({
        server:{
            baseDir:'./',
        },
        ghostMode:false
    });
    gulp.watch(["**/*.html","**/*.js","**/*.css"]).on('change',browserSync.reload);
});

gulp.task('sass',function(){
    let sassInit = function(){
        return gulp.src('src/scss/*.scss')
        .pipe(sass().on('error',sass.logError))
        .pipe(gulp.dest('app/css'));
    }
    gulp.watch('src/scss/*.scss',sassInit);
});

gulp.task('minify', function () {
    let minifyInit = function(){
        return gulp.src(["app/css/*.css","!app/css/*.min.css"])
            .pipe(cleanCSS())
            .pipe(rename(
                {
                    suffix: '.min'
                }
            ))
            .pipe(gulp.dest('app/css'));
    }
    gulp.watch("app/css/*.css").on('change', minifyInit);
});

gulp.task('prefixer',function(){
    let prefixerInit = function(){
        return gulp.src(['app/css/*.css', "!app/css/*.min.css"])
        .pipe(autoprefixer({
            browsers:AUTOPREFIXER_BROWSERS,
            cascade:false
        }))
        .pipe(gulp.dest('app/css'));
    };
    gulp.watch("app/css/*.css").on('change', prefixerInit);
});

gulp.task('babel',function(){
    let babelInit = function(){
        return gulp.src("src/js/*.js")
            .pipe(plumber())
            .pipe(babel({ presets: ['@babel/env']}))
            .pipe(rename({
                suffix: '.babel',
            }))
            .pipe(gulp.dest('app/js'));
    }
    gulp.watch("src/js/*.js").on('change',babelInit); 
});

gulp.task('uglify',function(){
    let uglifyInit = function(){
        return gulp.src(["app/js/*.js", "!app/js/*.min.js"]) 
        .pipe(plumber())
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min',
        }))
        .pipe(gulp.dest('app/js'));
    }
    gulp.watch(["app/js/*.babel.js","!app/js/*.min.js"]).on('change', uglifyInit); 
});

gulp.task('scripts',gulp.parallel('babel','uglify'));

gulp.task('styles',
    gulp.series('sass',
                'prefixer'));

gulp.task('default',gulp.parallel('sync','styles','minify','prefixer','scripts'));