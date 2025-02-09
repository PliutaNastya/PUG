import gulp from 'gulp';
import gulpPug from 'gulp-pug';
import gulpSass from 'gulp-sass';
import sass from 'sass';
import browserSync from 'browser-sync';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import terser from 'gulp-terser';
import svgSprite from 'gulp-svg-sprite';
import { deleteAsync } from 'del';
import postcss from 'gulp-postcss';
import mqpacker from 'css-mqpacker';

const server = browserSync.create();
const paths = {
  styles: {
    src: 'src/scss/**/*.scss',
    dest: 'dist/css'
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'dist/js'
  },
  pug: {
    src: ['src/pug/**/*.pug', '!src/pug/includes/**/*.pug'],
    dest: 'dist'
  },
  images: {
    src: 'src/images/**/*.{jpg,jpeg,png,gif,webp,svg}',
    dest: 'dist/images'
  },
  svg: {
    src: 'src/images/icons/*.svg',
    dest: 'dist/images/sprites'
  }
};

const scssCompiler = gulpSass(sass);

export const clean = () => deleteAsync(['dist']);

export const styles = () => {
  return gulp.src(paths.styles.src)
    .pipe(scssCompiler().on('error', scssCompiler.logError))
    .pipe(autoprefixer())
    .pipe(postcss([mqpacker()]))
    .pipe(gulp.dest(paths.styles.dest)) // Немінімізована версія
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.styles.dest + '/min')) // Мінімізована версія
    .pipe(server.stream());
};

export const scripts = () => {
  return gulp.src(paths.scripts.src)
    .pipe(gulp.dest(paths.scripts.dest)) // Немінімізована версія
    .pipe(terser())
    .pipe(gulp.dest(paths.scripts.dest + '/min')) // Мінімізована версія
    .pipe(server.stream());
};

export const templates = () => {
  return gulp.src(paths.pug.src)
    .pipe(gulpPug({ pretty: true }))
    .pipe(gulp.dest(paths.pug.dest))
    .pipe(server.stream());
};

export const images = () => {
  return gulp.src(paths.images.src)
    .pipe(gulp.dest(paths.images.dest));
};

export const svgSpriteTask = () => {
  return gulp.src(paths.svg.src)
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(gulp.dest(paths.svg.dest));
};

export const serve = () => {
  server.init({
    server: {
      baseDir: 'dist'
    }
  });

  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.pug.src, templates);
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.svg.src, svgSpriteTask);
};

export const build = gulp.series(clean, gulp.parallel(styles, scripts, templates, images, svgSpriteTask), serve);

export default build;
