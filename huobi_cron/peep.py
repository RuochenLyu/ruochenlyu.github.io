#!/usr/local/bin/python3

import requests
import json
import re

def process_data(data):
  match = re.search(r'([a-zA-Z]{2,4})\/USDT', data['title'])

  if match is None: return
  base_currency = match.group(1).lower()
  quote_currency = [x for x in symbols if x['base-currency'] == base_currency]

  if quote_currency == []: return
  print(quote_currency[0]['symbol'])


symbols = json.load(open('symbols.json'))['data']
local_data = json.load(open('notice.json'))
data = requests.get(url='https://www.huobi.com/p/api/contents/pro/list_notice?limit=1&language=zh-cn').json()['data']['items'][0]

if local_data['id'] == data['id']:
  process_data(data)

  with open('notice.json', 'w') as outfile:
    json.dump(data, outfile)
