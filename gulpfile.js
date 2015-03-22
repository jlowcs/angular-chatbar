var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var merge = require('merge-stream');
var stylus = require('gulp-stylus');
var rename = require("gulp-rename");
var nib = require("nib");

gulp.task('default', function() {
	var othersUmd = gulp.src(['src/**/*.js', '!src/main.js'])
		.pipe(babel({
			modules: 'umdStrict',
			moduleRoot: 'angular-chatbar',
			moduleIds: true
		})),
		mainUmd = gulp.src('src/main.js')
		.pipe(babel({
			modules: 'umdStrict',
			moduleIds: true,
			moduleId: 'angular-chatbar'
		}))
	;

	var js = merge(othersUmd, mainUmd)
		.pipe(concat('angular-chatbar.umd.js'))
		.pipe(gulp.dest('dist'));

	var css = gulp.src('styles/chatbar.styl')
	    .pipe(stylus({use: nib()}))
	    .pipe(rename('angular-chatbar.css'))
	    .pipe(gulp.dest('dist'));

	var cssTheme = gulp.src('styles/chatbar.default-theme.styl')
	    .pipe(stylus({use: nib()}))
	    .pipe(rename('angular-chatbar.default-theme.css'))
	    .pipe(gulp.dest('dist'));

	var cssThemeAnim = gulp.src('styles/chatbar.default-theme.animations.styl')
	    .pipe(stylus({use: nib()}))
	    .pipe(rename('angular-chatbar.default-theme.animations.css'))
	    .pipe(gulp.dest('dist'));

	return merge(js, css, cssTheme, cssThemeAnim);
});
