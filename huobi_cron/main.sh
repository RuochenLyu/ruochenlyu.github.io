#!/bin/bash

symbol=`python3 peep.py`

if [ ${symbol} ];then
  echo ${symbol}
  ruby temp.rb ${symbol}
fi
