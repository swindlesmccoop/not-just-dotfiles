#!/bin/sh
set -e

mkdir release
cd release
git clone https://github.com/swindlesmccoop/P4GPC-Randomizer.git
mv P4GPC-Randomizer/ release/
cd release

rm -rf docs/ 1.jpg data_e.txt README.md .git/

echo PLEASE VISIT "https://swindlesmccoop.xyz/P4GPC-Randomizer/#instructions FOR INSTRUCTIONS!" > INSTRUCTIONS.txt

cd 'Unstable Features'
mv readme.md readme.txt

cd ..

zip -r release.zip *
