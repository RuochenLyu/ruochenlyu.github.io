#!/bin/bash

currency=`python3 peep.py`

if [ ${currency} ];then
  echo ${currency}
  ruby ~/Documents/hadax_demo/open_a_position.rb ${HUOBI_KEY} ${HUOBI_SECRET} ${HUOBI_ID} ${currency}
fi
