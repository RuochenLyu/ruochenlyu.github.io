require 'csv'
require 'json'
require 'date'

response_buy = `curl --request GET --url 'https://api-otc.huobi.pro/v1/otc/trade/list/public?coinId=2&tradeType=1&currentPage=1&payWay=&country=&merchant=1&online=1&range=0' --header 'Cache-Control: no-cache'`
response_sell = `curl --request GET --url 'https://api-otc.huobi.pro/v1/otc/trade/list/public?coinId=2&tradeType=0&currentPage=1&payWay=&country=&merchant=1&online=1&range=0' --header 'Cache-Control: no-cache'`
response_price = `curl --request GET --url 'https://otc-api.huobipro.com/v1/otc/base/market/price' --header 'Cache-Control: no-cache'`

CSV.open('data.csv', 'a+') do |csv|
  csv << [
    DateTime.parse(DateTime.now.strftime("%Y-%m-%dT%H:%M%z")),
    JSON.parse(response_buy)['data'][0]['fixedPrice'],
    JSON.parse(response_sell)['data'][0]['fixedPrice'],
    JSON.parse(response_price)['data'][2]['price']
  ]
end
