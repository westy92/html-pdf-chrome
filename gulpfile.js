var del = require('del');
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const mocha = require('gulp-spawn-mocha');
const tslint = require('gulp-tslint');
const ts = require('gulp-typescript');
var remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');

const tsProject = ts.createProject('tsconfig.json');

gulp.task('clean', () => {
  return del(['coverage', 'lib']);
});

gulp.task('default', ['lint', 'scripts', 'test', 'coverage'], () => {});

gulp.task('scripts', () => {
  return gulp.src(['src/**/*.ts', 'test/**/*.ts'], { base: '.' })
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write('.', {
      sourceRoot: '..',
    }))
    .pipe(gulp.dest('lib'));
});

gulp.task('lint', ['scripts'], () => {
  return gulp.src(['src/**/*.ts', 'test/**/*.ts'])
    .pipe(tslint({
      configuration: './tslint.json',
      formatter: 'verbose',
      tslint: require('tslint'),
    }))
    .pipe(tslint.report({
      emitError: false,
      summarizeFailureOutput: true,
    }));
});

gulp.task('coverage', ['test'], () => {
  return gulp.src('coverage/coverage-final.json')
    .pipe(remapIstanbul({
      reports: {
        'text': null,
        'text-summary': null,
        'html': 'coverage/html-report',
      }
    }));
});

gulp.task('test', ['scripts'], () =>
  gulp.src('lib/test/**/*.js', {read: false})
    .pipe(mocha({
      istanbul: true,
      timeout: 15000,
    }))
);
