const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const pug = require('gulp-pug');
const del = require('del');
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');

gulp.task('pug', function(callback) {
	return gulp.src('./src/pug/pages/**/*.pug')
	.pipe(plumber({
		errorHandler: notify.onError(function(err) {
			return {
				title: 'Pug',
				sound: false,
				message: err.message
			}
		})
	}))
	.pipe(pug({
		pretty: true
	}))
	.pipe(gulp.dest('./build/'))
	.pipe(browserSync.stream())
	callback();
});

gulp.task('scss', function(callback) {
	return gulp.src('./src/scss/style.scss')
	.pipe(sourcemaps.init())
	.pipe(plumber({
		errorHandler: notify.onError(function(err) {
			return {
				title: 'Styles',
				sound: false,
				message: err.message
			}
		})
	}))
	.pipe(sass())
	.pipe(autoprefixer({
		overrideBrowserslist: ['last 4 versions']
	}))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('./build/css/'))
	.pipe(browserSync.stream())
	callback();
});

gulp.task('copy:img', function(callback) {
	return gulp.src('./src/img/**/*.{jpg,png}')
	.pipe(gulp.dest('./build/img/'))
	.pipe(browserSync.stream())
	callback();
});

gulp.task('copy:js', function(callback) {
	return gulp.src('./src/js/**/*.*')
	.pipe(gulp.dest('./build/js/'))
	.pipe(browserSync.stream())
	callback();
});

gulp.task('svg', function(callback) {
	 return gulp.src('./src/img/**/*.svg')
        .pipe(svgmin({
          js2svg: {
            pretty: true
          }
        }))
        .pipe(cheerio({
          run: function (gulp) {
            gulp('[fill]').removeAttr('fill');
            gulp('[stroke]').removeAttr('stroke');
            gulp('[style]').removeAttr('style');
          },
          parserOptions: {xmlMode: true}
        }))
        .pipe(replace('&gt;', '>'))
        // build svg sprite
        .pipe(svgSprite({
          mode: {
            symbol: {
              sprite: 'sprite.svg'
            }
          }
        }))
        .pipe(gulp.dest('build/img'))
        callback();
});

gulp.task('watch', function() {
	watch(['./build/img/**/*.*', './build/js/**/*.*'], gulp.parallel(browserSync.reload));

	// watch(['./build/*.html', './build/css/**/*.css'], gulp.parallel(browserSync.reload));

	watch('./src/scss/**/*.scss', function() {
		setTimeout(gulp.parallel('scss'), 1000)
	});

	watch('./src/pug/**/*.pug', gulp.parallel('pug'))
	watch('./src/img/**/*.*', gulp.parallel('copy:img'))
	watch('./src/js/**/*.*', gulp.parallel('copy:js'))
	
});

gulp.task('server', function() {
	browserSync.init({
		server: {
			baseDir: "./build/"
		}
	});
});

gulp.task('clean:build', function() {
	return del('./build')
});

// gulp.task('default', gulp.parallel('server', 'watch', 'scss', 'pug') );

gulp.task('default', gulp.series(gulp.parallel('clean:build'), gulp.parallel('scss', 'pug', 'copy:img', 'copy:js', 'svg'), gulp.parallel('server', 'watch'),));