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
  return quote_currency[0]['base-currency']


symbols = json.load(open('symbols.json'))['data']
data = requests.get(url='https://content.huobi.pro/p/api/contents/pro/list_notice?limit=10&language=zh-cn').json()['data']['items']
max_id = max(item['id'] for item in data)
# 上次买入的数字货币
temp = open('temp.txt').read().replace('\n', '')

for item in data:
  # API 通告不是按照时间顺序排序的，这里取最新的通告
  if max_id != item['id']: continue
  currency = process_data(item)
  if currency and currency != temp: print(currency)
