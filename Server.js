// 引入套件
const request = require('request'); // 網路連線用 主要用於post/get
const express = require('express'); // 網路通訊用 用於監聽port
const puppeteer = require('puppeteer');

// 宣告app
const app = express();

// line notify 網址
const pushURL = 'https://notify-api.line.me/api/notify';

// 因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
const server = app.listen(process.env.PORT || 8080, function() {
    const port = server.address().port;
    console.log('正常啟動 目前port為 : ', port);
});

async function getWebInfo(text, getUrl, token) {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page.goto(`${getUrl}?lang=zh-Hant`);
    await page.waitForSelector('section')

    let body = await page.content()
    const linkHandlers = await page.$x("//span[contains(text(), '查看')]");
    console.log(linkHandlers.length);
    if (linkHandlers.length > 0) {
        await linkHandlers[linkHandlers.length -1].click({button: "left", clickCount: 1});
        // await page.waitFor(1500);
        // await linkHandlers[1].click({button: "left", clickCount: 1});
    }
    await page.waitFor(1500);
    const imageElement = await page.$x("//img[@alt='圖片']");
    let imageUrl;
    for (const data of imageElement) {
        imageUrl = (await (await data.getProperty('src'))._remoteObject.value);
    }
    postToNotify(text, token, imageUrl)
    await browser.close();
}

/**
 * 發送至notify
 * @param {String} notifyMsg   發送的訊息
 * @param {String} notifyToken 發送用的token
 */
function postToNotify(notifyMsg, notifyToken, imageUrl) {
    const headers = {
        'Authorization': 'Bearer ' + notifyToken,
        'Content-Type': 'application/x-www-form-urlencoded',
    };
    // 檢查用字串
    // const checkUse = sensitiveInspection === true ? '來源網址: ' + notifyMsg['url'] + enterLine + '原始網址: ' + notifyMsg['true_url'] + enterLine + '是否為敏感內容: ' + notifyMsg['private'] + enterLine + notifyMsg['title'] + ' 說 : ' : '';

     request.post({
         uri: pushURL,
         headers: headers,
         formData: {
             'message': notifyMsg,
             'imageThumbnail': imageUrl,
             'imageFullsize': imageUrl,
         }
     }, function (err, httpResponse, body) {
         if (err != null) {
             console.log('錯誤 : ' + err);
         }
         console.log('PostNotify回傳 : ' + body);
     });
}


app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

/**
 * 操控流程 body接收到url與token(選填)後
 * 分析該文章內圖片與內容 若有媒體內容則抓取推送至token
 */
app.post('/', async (req, res)=>{
    const bodyText = req.body['text'] === undefined ? '' : req.body['text']; // 抓取
    if(bodyText.indexOf('RT @') === -1 ){
        const bodyToken = req.body['NotifyToken'] === undefined ? defaultToken : req.body['NotifyToken'];
        await getWebInfo()
        res.json(req.body); // 回post的內容給發送者
    }

});
