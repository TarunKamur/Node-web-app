const { task, src, dest, series } = require("gulp");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const clean = require('gulp-clean');

task('copy-public', (done) => {
  const argv = yargs(hideBin(process.argv)).argv; 
  src(`./environments/${argv.tenant}-${argv.enr}/public/**/*`,{dot:true}).pipe(dest('./public'));
  done(); 
});

task('copy-config', (done) => {
  const argv = yargs(hideBin(process.argv)).argv; 
  src(`./environments/${argv.tenant}-${argv.enr}/config/**/*.*`).pipe(dest('./config'));
  done(); 
});

task('copy-locale', (done) => {
  const argv = yargs(hideBin(process.argv)).argv; 
  src(`./environments/${argv.tenant}-${argv.enr}/.i18n/**/*.*`).pipe(dest('./.i18n'));
  done(); 
});

task('copy-env', (done) => {
  const argv = yargs(hideBin(process.argv)).argv; 
  src(`./environments/${argv.tenant}-${argv.enr}/env/**/*.*`).pipe(dest('./env'));
  done(); 
});

task('copy-styles', (done) => {
  const argv = yargs(hideBin(process.argv)).argv; 
  src(`./environments/${argv.tenant}-${argv.enr}/styles/**/*.*`).pipe(dest('./styles'));
  done(); 
});

task('copy-seo', (done) => {
  const argv = yargs(hideBin(process.argv)).argv; 
  src(`./environments/${argv.tenant}-${argv.enr}/seo/**/*.*`).pipe(dest('./seo'));
  done(); 
});

task('clean-public', () => {  
  return src('./public', { read: false, allowEmpty: true,dot:true }) 
    .pipe(clean());   
});

task('clean-config', () => {  
  return src('./config', { read: false, allowEmpty: true }) 
    .pipe(clean());   
});

task('clean-locale', () => {  
  return src('./.i18n', { read: false, allowEmpty: true }) 
    .pipe(clean());   
});

task('clean-env', () => {  
  return src('./env', { read: false, allowEmpty: true }) 
    .pipe(clean());   
});

task('clean-styles', () => {  
  return src('./styles', { read: false, allowEmpty: true }) 
    .pipe(clean());   
});

task('clean-seo', () => {  
  return src('./seo', { read: false, allowEmpty: true }) 
    .pipe(clean());   
});

exports.copyResources = series('clean-public', 'clean-config' , 'clean-locale' ,'clean-env','clean-styles','clean-seo','copy-public','copy-config','copy-locale','copy-env','copy-styles','copy-seo')
