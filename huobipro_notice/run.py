#!/usr/local/bin/python3

import requests
import json
import re
import time
import datetime
import jieba
import jieba.analyse
import itchat

def send_message(message):
  print(datetime.datetime.now(), '\nSend to wechat.')
  # test = itchat.search_friends(nickName='吕若尘')[0]
  # test.send(message)
  chatroom_id = itchat.get_chatrooms()[0]['UserName']
  itchat.send(message, toUserName=chatroom_id)
  print('------------------------------------------')

def process_data(item):
  content = re.sub('[0-9]', '', item['title'])
  tags = jieba.analyse.extract_tags(content, 10)
  match = re.search(r'\|([a-zA-Z]{3,4})\|', '|'+'|'.join(tags)+'|')

  if match is None:
    send_message('%s\nhttps://www.huobipro.com/zh-cn/notice_detail/?id=%s'%(item['title'], item['id']))
  else:
    base_currency = match.group(1).lower()
    quote_currency = [x for x in symbols if x['base-currency'] == base_currency]

    if quote_currency == []:
      message = '%s\n\n%s\n%s\n' \
        %(base_currency, '|'.join(tags), item['title'])
    else:
      message = '重要！重要！重要！\n%s/%s\n\n%s\n%s\n' \
        %(base_currency, quote_currency[0]['quote-currency'], '|'.join(tags), item['title'])
    message += 'https://www.huobipro.com/zh-cn/notice_detail/?id=%s'%(item['id'])
    send_message(message)


print('Hey, bro!')
jieba.analyse.set_stop_words('./extra_dict/stop_words.txt')
itchat.auto_login(hotReload=True, enableCmdQR=2)

symbols = json.load(open('symbols.json'))['data']
interval = 15

while 1:
  data = requests.get(url='https://www.huobi.com/p/api/contents/pro/list_notice?limit=10&language=zh-cn').json()['data']['items']
  print(datetime.datetime.now(), '\nGet data.')

  for item in data:
    if time.time() - item['created']/1000 > interval: continue
    process_data(item)

  print('Sleep...')
  time.sleep(1*interval)
  print('Do it again.')
