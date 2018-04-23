#!/bin/zsh
source ~/.zshrc

export https_proxy=http://127.0.0.1:8888;export http_proxy=http://127.0.0.1:8888
currency=`/usr/local/bin/python ./peep.py`

if [ ${currency} ];then
  echo ${currency} > temp.txt
  ruby ~/Documents/hadax_demo/open_a_position.rb ${HUOBI_KEY} ${HUOBI_SECRET} ${HUOBI_ID} 'btc' ${currency} 0.001 market
fi
