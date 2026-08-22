/*
 * Build script: genera ../index.html autònom a partir de template.html + app.js,
 * incrustant Leaflet, fflate i un bundle de fit-file-parser.
 *
 * Ús:  npm install  &&  npm run build
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const here = __dirname;
const nm = (p) => path.join(here, 'node_modules', p);

// 1) Bundle de fit-file-parser cap a un IIFE que exposa window.FitParser
const fitEntry = path.join(here, '.fitentry.js');
fs.writeFileSync(fitEntry, "const m=require('fit-file-parser');window.FitParser=m.default||m.FitParser||m;\n");
const fitJs = esbuild.buildSync({
  entryPoints: [fitEntry],
  bundle: true,
  minify: true,
  format: 'iife',
  globalName: 'FITBUNDLE',
  write: false,
}).outputFiles[0].text;
fs.unlinkSync(fitEntry);

// 2) Llegeix la resta de llibreries i el codi de l'app
const leafletCss = fs.readFileSync(nm('leaflet/dist/leaflet.css'), 'utf8');
const leafletJs = fs.readFileSync(nm('leaflet/dist/leaflet.js'), 'utf8');
const fflateJs = fs.readFileSync(nm('fflate/umd/index.js'), 'utf8');
const appJs = fs.readFileSync(path.join(here, 'app.js'), 'utf8');

// 3) Munta l'HTML final
let html = fs.readFileSync(path.join(here, 'template.html'), 'utf8');
html = html.replace('/*LEAFLET_CSS*/', () => leafletCss);
html = html.replace('/*LEAFLET_JS*/', () => leafletJs);
html = html.replace('/*FFLATE_JS*/', () => fflateJs + '\nwindow.fflate = window.fflate || fflate;');
html = html.replace('/*FIT_JS*/', () => fitJs);
html = html.replace('/*APP_JS*/', () => appJs);

const out = path.join(here, '..', 'index.html');
fs.writeFileSync(out, html);
console.log('Generat', out, '(' + (html.length / 1024).toFixed(0) + ' KB)');
