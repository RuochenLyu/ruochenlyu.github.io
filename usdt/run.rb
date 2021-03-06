require 'csv'
require 'json'
require 'date'

response_buy = `curl --request GET --url 'https://otc-api.eiijo.cn/v1/data/trade-market?coinId=2&currency=1&tradeType=buy&currPage=1&payMethod=0&country=37&blockType=general&online=1' --header 'Cache-Control: no-cache'`
response_sell = `curl --request GET --url 'https://otc-api.eiijo.cn/v1/data/trade-market?coinId=2&currency=1&tradeType=sell&currPage=1&payMethod=0&country=37&blockType=general&online=1' --header 'Cache-Control: no-cache'`
buy_price = JSON.parse(response_buy)['data'][0]['price']
sell_price = JSON.parse(response_sell)['data'][0]['price']
base_price = nil

if Time.new.hour == 0 and Time.new.min == 0
  response_price = `curl --request GET --url 'http://www.apilayer.net/api/live?access_key=2fc9d3a4761e1c3cacbd2f6e0f6f205f&format=1&currencies=CNY' --header 'Cache-Control: no-cache'`
  base_price = JSON.parse(response_price)['quotes']['USDCNY']
else
  base_price = CSV.open('data.csv').readlines[-1][3]
end

CSV.open('data.csv', 'a+') do |csv|
  csv << [
    DateTime.parse(DateTime.now.strftime("%Y-%m-%dT%H:%M%z")),
    buy_price,
    sell_price,
    base_price
  ]
end
