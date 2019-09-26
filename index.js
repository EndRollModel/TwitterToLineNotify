// 引入套件
const request = require('request'); // 網路連線用 主要用於post
const cheerio = require('cheerio'); // 爬取網頁資訊用
const express = require('express'); // 網路通訊用 用於監聽port

// 宣告app
const app = express();

// line notify 網址
const pushURL = 'https://notify-api.line.me/api/notify';

// 預設用 const defaultToken  = process.env.defaultToken;
const defaultToken = process.env.defaultToken;

// 換行符號
const enterLine = '\r\n';

// 檢查用開關 如果開啟 會在文章中偵測是否敏感內容 顯示此為敏感內容
const sensitiveInspection = false;

/**
 * get page info 取得頁面資訊
 * @param {URL/String}  sourceURL      傳入的網址
 * @param {String}      pushKey        推播金鑰
 */
function getPageInfo( sourceURL, pushKey ) {
    const countResult = {}; // 全部的物件
    const imageResult = []; // 裝圖的陣列
    const DescriptionResult = []; // 裝訊息的陣列

    request({url: sourceURL, method: 'GET'}, function(error, response, body) {
        if (error || !body) {
            console.log(' 錯誤 : 網址/網頁取得錯誤 '); return;
        }

        // 資料包
        const $ = cheerio.load(body); // 載入 body
        const ogImage = $('meta[property=\'og:image\']'); // 發布的圖片 如果沒有圖片就載入頭像
        const ogDescription = $('meta[property=\'og:description\']'); // 發布的推文內容
        const ogUrl = $('meta[property=\'og_url\']'); // 貼文的網址 (通常包含@id) 目前不幹事情
        const ogTitle = $('meta[property=\'og:title\']'); // 貼文的網址 (通常包含@id) 目前不幹事情
        const sensitiveContentCheck = $('.Tombstone-label'); // 敏感內容偵測
        const defaultLink = $('link[hreflang=\'x-default\']'); // 預設網址 比對用

        // 取得推文與內容
        DescriptionResult.push(ogDescription.eq(0).attr('content')); // 推文只會有一則 所以就只取一則
        for (let i = 0; i < ogImage.length; i++) {
            if (ogImage.eq(i).attr('content').search(/media|instagram/)>-1) {
                imageResult.push(ogImage.eq(i).attr('content')); // 圖片可能有多則 就取多則
            }
        }

        // 取得網址body內的所有值
        countResult['url'] = sourceURL;
        countResult['true_url'] = defaultLink.eq(0).attr('href');
        countResult['text'] = DescriptionResult;
        countResult['image'] = imageResult;
        countResult['private'] = sensitiveContentCheck.text() !== '' ? '是' : '否';
        countResult['title'] = ogTitle.eq(0).attr('content').replace(' on Twitter', '');
        countResult['external'] = countResult['text'].toString().match(/https:\/\/t.co\/.{10}/g);
        countResult['send_type'] = countResult['image'].length === 0 ? 'text' : 'image';

        // hashtag
        // 內有其他網址則重新進入新的一圈
        if ( countResult['external'] !== null ) {
            if (countResult['external'].toString() !== countResult['url'].toString() &&
                countResult['external'].toString() !== countResult['true_url'].toString()) {
                console.log('偵測到內有網址 另外轉移');
                getPageInfo(countResult['external'].toString(), pushKey);
                return;
            }
        }

        // 如果網址抓取失敗 直接終止
        if (countResult['url'].indexOf('ifttt') > -1 || countResult['true_url'].indexOf('ifttt') > -1) return;

        console.log('推文文字 : ' + countResult['text'] );
        console.log('推文圖片 : ' + countResult['image'] );
        console.log('來源網址 : ' + countResult['url'] );
        console.log('原始網址 : ' + countResult['true_url'] );
        console.log('撈取網址 : ' + countResult['external'] );
        console.log('隱私開關 : ' + countResult['private'] );
        console.log('推文作者 : ' + countResult['title'] );
        console.log('推文類型 : ' + countResult['send_type']);

        // 如果圖片不為零 且不是大頭貼 才對notify做發送
        if (pushKey === null || pushKey === '') return;
        postToNotify(countResult, pushKey);
    });
}

/**
 * 發送至notify
 * @param {String} notifyMsg   發送的訊息
 * @param {String} notifyToken 發送用的token
 */
function postToNotify(notifyMsg, notifyToken) {
    const headers = {
        'Authorization': 'Bearer '+ notifyToken,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    // 檢查用字串
    const checkUse = sensitiveInspection === true ? '來源網址: ' + notifyMsg['url'] + enterLine + '原始網址: ' + notifyMsg['true_url'] + enterLine + '是否為敏感內容: ' + notifyMsg['private'] + enterLine + notifyMsg['title'] + ' 說 : ' : '';

    if (notifyMsg['send_type'] === 'image') {
        notifyMsg['image'].forEach(function(value, key) {
            request.post({
                uri: pushURL,
                headers: headers,
                formData: {
                    'message': enterLine + checkUse + notifyMsg['text'],
                    'imageThumbnail': notifyMsg['image'][key],
                    'imageFullsize': notifyMsg['image'][key],
                }}, function( err, httpResponse, body ) {
                if (err != null) {
                    console.log('錯誤 : ' + err);
                }
                console.log('PostNotify回傳 : ' + body);
            });
        });
    } else {
        notifyMsg['text'].forEach(function(value, index) {
            request.post({
                uri: pushURL,
                headers: headers,
                formData: {
                    'message': enterLine + checkUse + notifyMsg['text'],
                },
            }, function(err, httpResponse, body) {
                if (err != null) {
                    console.log('錯誤 : ' + err);
                }
                console.log('PostNotify回傳 : ' + body);
            });
        });
    }
}

// ---------------------------------網路連線框架---------------------------------
// 因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
const server = app.listen(process.env.PORT || 8080, function() {
    const port = server.address().port;
    console.log('正常啟動 目前port為 : ', port);
});

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

/**
 * 操控流程 body接收到url與token(選填)後
 * 分析該文章內圖片與內容 若有媒體內容則抓取推送至token
 */
app.post('/', (req, res)=>{
    const bodyToken = req.body['NotifyToken'] === undefined ? defaultToken : req.body['NotifyToken'];
    getPageInfo( req.body['FirstLinkUrl'], bodyToken );
    res.json(req.body); // 回post的內容給發送者
});
