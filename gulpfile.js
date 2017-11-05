var del = require('del');
const gulp = require('gulp');
const gulpTsLint = require('gulp-tslint');
const sourcemaps = require('gulp-sourcemaps');
const mocha = require('gulp-spawn-mocha');
const ts = require('gulp-typescript');
const tslint = require('tslint');
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
    .pipe(gulpTsLint({
      configuration: './tslint.json',
      formatter: 'verbose',
      program: tslint.Linter.createProgram('./tsconfig.json'),
      tslint: tslint,
    }))
    .pipe(gulpTsLint.report({
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
        'json': 'coverage/coverage-remapped.json',
      }
    }));
});

gulp.task('test', ['scripts'], () =>
  gulp.src('lib/test/**/*.js', {read: false})
    .pipe(mocha({
      istanbul: true,
      timeout: 15000,
      retries: 4,
    }))
);
