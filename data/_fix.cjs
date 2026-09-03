'use strict';
const fs = require('fs');
let s = fs.readFileSync('_translate.cjs', 'utf8');
const needle = '(?<!\\d)';
let count = s.split(needle).length - 1;
s = s.split(needle).join('(?<![a-z0-9])');
fs.writeFileSync('_translate.cjs', s, 'utf8');
console.log('replaced:', count);
