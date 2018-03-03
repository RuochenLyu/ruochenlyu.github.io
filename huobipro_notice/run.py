#!/usr/local/bin/python3

import requests
import json
import re
import time
import jieba
import jieba.analyse
import itchat

def send_message(message):
  # test = itchat.search_friends(nickName='吕若尘')[0]
  # test.send(message)
  chatroom_id = itchat.get_chatrooms()[0]['UserName']
  itchat.send(message, toUserName=chatroom_id)

def process_data(item):
  content = re.sub('[0-9]', '', item['title'])
  tags = jieba.analyse.extract_tags(content, 10)
  match = re.search(r'\|([a-zA-Z]{3,4})\|', '|'+'|'.join(tags)+'|')

  if match is None: return
  base_currency = match.group(1).lower()
  quote_currency = [x for x in symbols if x['base-currency'] == base_currency]

  if quote_currency == []: return
  message = '%s/%s\n\n%s\n%s\n' \
    %(base_currency, quote_currency[0]['quote-currency'], '|'.join(tags), item['title'])
  message += 'https://www.huobipro.com/zh-cn/notice_detail/?id=%s'%(item['id'])
  send_message(message)


jieba.analyse.set_stop_words('./extra_dict/stop_words.txt')
itchat.auto_login(hotReload=True, enableCmdQR=2)

while True:
  symbols = json.load(open('symbols.json'))['data']
  local_data = json.load(open('notice.json'))
  data = requests.get(url='https://www.huobi.com/p/api/contents/pro/list_notice?limit=10&language=zh-cn').json()['data']['items']

  for item in data:
    if [x for x in local_data if x['id'] == item['id']] != []: continue
    process_data(item)

  with open('notice.json', 'w') as outfile:
    json.dump(data, outfile)
  time.sleep(10*60)
