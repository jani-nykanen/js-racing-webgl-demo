#!/bin/sh
cd "$(dirname "$0")"
cp ../lib/gl-matrix-min.js gl-matrix-min.js 
cp ../lib/webgl-obj-loader.min.js webgl-obj-loader.min.js
cp -r ../assets assets
java -jar closure.jar --js ../src/*.js --js_output_file out.js #--compilation_level ADVANCED_OPTIMIZATIONS --language_out ECMASCRIPT_2018
cat html_up.txt > index.html
cat out.js >> index.html
cat html_down.txt >> index.html
zip -r ../dist.zip gl-matrix-min.js webgl-obj-loader.min.js assets index.html

rm index.html
rm -rf assets
rm -rf gl-matrix-min.js 
rm -rf webgl-obj-loader.min.js
rm -rf out.js
