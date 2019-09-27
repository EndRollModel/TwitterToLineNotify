# TwitterToLineNotify
IFTTT With Twitter To LineNotify <br/>

從推特取得網址後經由Line的Notify通知圖片與推文的一個小工具

**本教學以[比村老師](https://twitter.com/strangestone?lang=zh-tw)作範例**

**首先請先準備以下工具**

* **IFTTT 帳號 (可以經由Google帳號申請)**  https://ifttt.com/          <br/>
* **Heroku 帳號** https://www.heroku.com/                            <br/>
* **LineNotify帳號** https://notify-bot.line.me/zh_TW/               <br/>
* **Twitter帳號** https://twitter.com                                <br/> 

*以下為教學流程*

--------------------------------------------------

1. 登入LineNotify 申請一個 Notify 的權杖(token) 先將Notify設定好群組與名稱

2. 按下此按鈕將專案匯入 <br/> [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy) 

3. Heroku專案匯入完成後 點選右上角的 openApp 複製該網址 

4. IFTTT  IF 選擇 Twitter -> New tweet from search 這裡輸入你想追蹤的推主/對象 (可使用[進階搜尋](https://twitter.com/search-advanced?lang=zh-tw)方式指定追蹤)
* 範例 : 包含此處字詞 :  ``` 月曜日のたわわ その 「 」```  ,  來自這些帳號 : ```@Strangestone``` 確定後 <br/>
  搜尋串 ```月曜日のたわわ その 「 」 from:Strangestone``` 將此串貼在 IFTTT 
  
5. IFTTT than 選擇 WebHooks 後 
   * URL 貼上 第一步取得的 ``` herokuAPPurl ```
   * Method 選擇 ``` post ```
   * Content Type 選擇 ``` application/json ```
   * Body 填入 ```{"FirstLinkUrl":"{{FirstLinkUrl}}"}```

--------------------------------------------------
