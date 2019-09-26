# TwitterToLineNotify
IFTTT With Twitter To LineNotify <br/>

從推特取得網址後經由Line的Notify通知圖片與推文的一個小工具

**本教學以比村老師作範例**

**請注意! 本篇教學目前需要一點程式基礎**

**首先請先準備以下工具**

* **IFTTT 帳號 (可以經由Google帳號申請)**  https://ifttt.com/          <br/>
* **Heroku 帳號** https://www.heroku.com/                            <br/>
* **LineNotify帳號** https://notify-bot.line.me/zh_TW/               <br/>
* **Twitter帳號** https://twitter.com                                <br/> 

*以下為教學流程*

--------------------------------------------------

1. 請先將本程式碼 Clone 或是 下載 上傳至heroku上部屬 [部屬教學](https://dwatow.github.io/2018/01-13-heroku-node-mvp/) 獲得 herokuAPPurl
> 簡易流程 : heroku 創建 project -> 下載 heroku cli -> cmd -> cd 到 程式碼資料夾 -> 上傳至heroku -> openAPP 獲得 herokuAPPurl 

2. 登入LineNotify 申請一個 Notify 的權杖(token) 並且指定 Notify 的位置與名稱

3. Heroku 的 project 選擇 setting 找到 Config Vars 項目選擇 Reveal Config Vars 內容 
   * key 填入 ```NotifyToken```
   * value 則填入 Line的notify token 之後選擇 add

3. IFTTT  IF 選擇 Twitter -> New tweet from search 這裡輸入你想追蹤的推主/對象 (可使用[進階搜尋](https://twitter.com/search-advanced?lang=zh-tw)方式指定追蹤)
* 範例 : 包含此處字詞 :  ``` 月曜日のたわわ その 「 」```  ,  來自這些帳號 : ```@Strangestone``` 確定後 <br/>
  搜尋串 ```月曜日のたわわ その 「 」 from:Strangestone``` 將此串貼在 IFTTT 
  
4. IFTTT than 選擇 WebHooks 後 
   * URL 貼上 第一步取得的 ``` herokuAPPurl ```
   * Method 選擇 ``` post ```
   * Content Type 選擇 ``` application/json ```
   * Body 填入 ```{"FirstLinkUrl":"{{FirstLinkUrl}}"}```

--------------------------------------------------
