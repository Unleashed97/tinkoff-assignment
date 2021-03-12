'use strict';

const { src, dest, parallel, series, watch } = require('gulp');
const sync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');

// HTML
const html = () => {
    return src('src/**/*.html')
        .pipe(htmlmin({
            removeComments: true,
            collapseWhitespace: true
        }))
        .pipe(dest('dist'))
        .pipe(sync.stream())
}

// Styles
const styles = () => {
    return src(['src/scss/main.scss'])
        .pipe(sass())
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], cascade: false }))
        .pipe(cleancss(({ level: { 1: { specialComments: 0}}})))
        .pipe(rename({
            basename: 'style',
            suffix: '.min'
        }))
        .pipe(dest('src/css/'))
        .pipe(dest('dist/css/'))
        .pipe(sync.stream())
}

// Scripts
const scripts = () => {
    return src(['src/js/script.js', 'src/js/**/*.js', '!src/js/script.min.js'])
        .pipe(concat('script.min.js'))
        .pipe(uglify())
        .pipe(dest('src/js/'))
        .pipe(dest('dist/js/'))
        .pipe(sync.stream())
}

// server
const server = () => {
    sync.init({
        server: { baseDir: 'src/'},
        notify: false,
        online: true
    })
}

// image minify
const images = () =>{
    return src('src/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}')
        .pipe(imagemin())
        .pipe(dest('dist/images/'))
        .pipe(sync.stream())
}

// fonts
const fonts = () =>{
    return src('src/fonts/**/*.{eot,woff,woff2,ttf,svg}')
        .pipe(dest('/dist/fonts/'))
        .pipe(sync.stream())
}

// Copy
const copy = () => {
    return src([
        'src/fonts/**/*',
        'src/images/**/*'
    ], {
        base: 'src'
    })
        .pipe(dest('dist/'))
        .pipe(sync.stream());
}

// cleandist
const cleandist = () => {
    return del('dist/**/*', { force: true })
}

// Watch
const watchFiles = () => {
    watch('src/*.html', html);
    watch('src/**/*.scss', styles);
    watch(['src/**/*.js', '!src/js/script.min.js'], scripts);
    watch('src/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}', images)
    watch('src/fonts/**/*.{eot,woff,woff2,ttf,svg}', fonts);
    watch('src/**/*.html').on('change', sync.reload);
}

const build = series(cleandist, parallel(html, styles, scripts, images));
const watcher = parallel(build, watchFiles, server);


// Export tasks
exports.server = server;
exports.html = html;
exports.scripts = scripts;
exports.styles = styles;
exports.copy = copy;
exports.images = images;
exports.cleandist = cleandist;
exports.build = build;
exports.default = watcher;

