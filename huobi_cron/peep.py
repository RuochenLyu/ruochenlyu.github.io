#!/usr/local/bin/python3

import requests
import json
import re
import time

def process_data(data):
  match = re.search(r'([a-zA-Z]{2,4})\/USDT', data['title'])

  if match is None: return
  base_currency = match.group(1).lower()
  quote_currency = [x for x in symbols if x['base-currency'] == base_currency]

  if quote_currency == []: return
  print(quote_currency[0]['base-currency'])


symbols = json.load(open('symbols.json'))['data']
data = requests.get(url='https://www.huobi.com/p/api/contents/pro/list_notice?limit=10&language=zh-cn').json()['data']['items']
interval = 10

for item in data:
  if time.time() - item['created']/1000 > interval: continue
  process_data(item)
