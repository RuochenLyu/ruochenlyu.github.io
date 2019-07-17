#!/bin/zsh
source ~/.zshrc

ruby ./usdt/run.rb
git pull --rebase
git commit -am "update data.csv $(date '+%Y-%m-%d %H:%M:%S')"
git push
