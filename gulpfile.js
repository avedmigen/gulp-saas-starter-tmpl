'use strict';

const gulp = require("gulp");
const { series } = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require('gulp-sass');
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const htmlmin = require("gulp-htmlmin");
const uglify = require('gulp-uglify-es').default;
const sync = require("browser-sync").create();

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.mozjpeg({quality: 85, progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"))
}

exports.images = images;

const webpimg = () => {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 75}))
    .pipe(gulp.dest("build/img"))
}

exports.webpimg = webpimg;


const sprite = () => {
  return gulp.src("source/img/**/{icon-*,logo-*, htmlacademy}.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;

// Build

const copy = () => {
  return gulp.src ([
    "source/fonts/**/*.woff*",
    "source/*.ico"
  ], {
      base: "source"
  })
    .pipe(gulp.dest("build"));
}

exports.copy = copy;

const html = () => {
  return gulp.src ([
    "source/*.html"
  ], {
    base: "source"
  })
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
}

exports.html = html;

const js = () => {
  return gulp.src ([
    "source/js/*.js"
  ], {
    base: "source"
  })
    .pipe(uglify())
    .pipe(rename("app.min.js"))
    .pipe(gulp.dest("build/js"));
}

exports.js = js;

const clean = () => {
  return del("build");
}

exports.clean = clean;

const build = series(
  clean,
  copy,
  html,
  styles,
  js,
  images,
  webpimg,
  sprite
);

exports.build = build;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", gulp.series("html"));
  gulp.watch("source/*.html").on("change", sync.reload);
  gulp.watch("source/js/*.js").on("change", gulp.series("js"));
  gulp.watch("source/js/*.js").on("change", sync.reload);
}

exports.default = gulp.series(
  build, server, watcher
);
