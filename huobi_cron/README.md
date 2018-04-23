先执行下 `python3 peep.py` 更新 `notice.json` 文件。

## 查询交易对

<https://api.huobipro.com/v1/settings/symbols>

<https://www.huobipro.com/-/x/pro/v1/settings/symbols>

## 本地配置

`crontab -e` 按下面的格式编辑 cronjob，地址和 shell 自行调整（我本地是 zsh）。

```
* 10-15 * * * cd ~/Documents/workspace/ruochenlyu.github.io/huobi_cron && /bin/zsh ./main.sh
* 10-15 * * * sleep 10;cd ~/Documents/workspace/ruochenlyu.github.io/huobi_cron && /bin/zsh ./main.sh
* 10-15 * * * sleep 20;cd ~/Documents/workspace/ruochenlyu.github.io/huobi_cron && /bin/zsh ./main.sh
* 10-15 * * * sleep 30;cd ~/Documents/workspace/ruochenlyu.github.io/huobi_cron && /bin/zsh ./main.sh
* 10-15 * * * sleep 40;cd ~/Documents/workspace/ruochenlyu.github.io/huobi_cron && /bin/zsh ./main.sh
* 10-15 * * * sleep 50;cd ~/Documents/workspace/ruochenlyu.github.io/huobi_cron && /bin/zsh ./main.sh
```
