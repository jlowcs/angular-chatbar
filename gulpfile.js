var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var merge = require('merge-stream');
var stylus = require('gulp-stylus');
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var cssmin = require("gulp-cssmin");
var ngAnnotate = require('gulp-ng-annotate');
var nib = require("nib");
var watch = require('gulp-watch');

function compileJs(devOnly) {
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
		})),
		stream = merge(othersUmd, mainUmd)
		.pipe(concat('angular-chatbar.umd.js'))
		.pipe(gulp.dest('dist'))
	;

	if (!devOnly) {
		stream = stream
		.pipe(ngAnnotate())
		.pipe(uglify())
		.pipe(rename('angular-chatbar.umd.min.js'))
		.pipe(gulp.dest('dist'));
	}

	return stream;
}

function compileCss(name, devOnly) {
	var stream = gulp.src('styles/' + name + '.styl')
		.pipe(stylus({use: nib()}))
		.pipe(rename('angular-' + name + '.css'))
		.pipe(gulp.dest('dist'))
	;

	if (!devOnly) {
		stream = stream.pipe(cssmin())
		.pipe(rename('angular-' + name + '.min.css'))
		.pipe(gulp.dest('dist'));
	}

	return stream;
}

function compileAllCss(devOnly) {
	var streams = [];

	['chatbar', 'chatbar.default-theme', 'chatbar.default-animations'].forEach(function (name) {
		streams.push(compileCss(name, devOnly));
	});

	return merge.apply(null, streams);
}

gulp.task('default', function() {
	return merge.apply(compileJs(), compileAllCss());
});

gulp.task('_watch', function() {
	watch('styles/**/*.styl', function () {
		compileAllCss(true);
	});
	watch('src/**/*.js', function () {
		compileJs(true);
	});
});

gulp.task('watch', ['default', '_watch']);
