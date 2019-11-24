require 'date'

city_list = [
  '深圳市',
  '广州市',
  '武汉市',
  '杭州市',
  '重庆市',
  '南京市',
  '上海市',
  '成都市',
  '北京市'
]

city_list.each do |city|
  data = `curl --request GET --url 'https://busi.supermonkey.com.cn/wxClass/getClassSelectList4?city=#{city}' --header 'Cache-Control: no-cache'`

  File.open("#{city}.json", 'w') do |f|
    f.write(data)
  end
end
