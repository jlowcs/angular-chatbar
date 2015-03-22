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

	var streams = [];

	streams.push(
		merge(othersUmd, mainUmd)
		.pipe(concat('angular-chatbar.umd.js'))
		.pipe(gulp.dest('dist'))
        .pipe(ngAnnotate())
    	.pipe(uglify())
		.pipe(rename('angular-chatbar.umd.min.js'))
		.pipe(gulp.dest('dist'))
	);

	['chatbar', 'chatbar.default-theme', 'chatbar.default-theme.animations'].forEach(function (name) {
		streams.push(
			gulp.src('styles/' + name + '.styl')
		    .pipe(stylus({use: nib()}))
		    .pipe(rename('angular-' + name + '.css'))
		    .pipe(gulp.dest('dist'))
		    .pipe(cssmin())
			.pipe(rename('angular-' + name + '.min.css'))
			.pipe(gulp.dest('dist'))
		);
	});

	return merge.apply(null, streams);
});
