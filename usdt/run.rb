require 'csv'
require 'json'
require 'date'

response_buy = `curl --request GET --url 'https://api-otc.huobi.pro/v1/otc/trade/list/public?coinId=2&tradeType=1&currentPage=1&payWay=&country=&merchant=1&online=1&range=0' --header 'Cache-Control: no-cache'`
response_sell = `curl --request GET --url 'https://api-otc.huobi.pro/v1/otc/trade/list/public?coinId=2&tradeType=0&currentPage=1&payWay=&country=&merchant=1&online=1&range=0' --header 'Cache-Control: no-cache'`
buy_price = JSON.parse(response_buy)['data'][0]['fixedPrice']
sell_price = JSON.parse(response_sell)['data'][0]['fixedPrice']
base_price = nil

if Time.new.min == 0
  response_price = `curl --request GET --url 'http://www.apilayer.net/api/live?access_key=2fc9d3a4761e1c3cacbd2f6e0f6f205f&format=1&currencies=CNY' --header 'Cache-Control: no-cache'`
  base_price = JSON.parse(response_price)['quotes']['USDCNY']
else
  base_price = CSV.open('data.csv').readlines[-1][3]
end

if buy_price > 2
  CSV.open('data.csv', 'a+') do |csv|
    csv << [
      DateTime.parse(DateTime.now.strftime("%Y-%m-%dT%H:%M%z")),
      buy_price,
      sell_price,
      base_price
    ]
  end
end
