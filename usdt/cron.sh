#!/bin/zsh
source ~/.zshrc

ruby ./run.rb
git commit -am "update data.csv $(date '+%Y-%m-%d %H:%M:%S')"
git pull --rebase
git push
