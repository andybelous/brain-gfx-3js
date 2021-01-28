#!/bin/bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
bash ~/.nvm/nvm.sh
nvm install node
sudo yum install atk java-atk-wrapper at-spi2-atk gtk3 libXt -y
npm i puppeteer
npm i puppeteer-core
