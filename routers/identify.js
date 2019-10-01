const express = require('express');
//创建路由器对象
var router = express.Router();
var request = require('request');
var multiparty = require('multiparty');
var fs = require("fs");
var AipImageClassifyClient = require("baidu-aip-sdk").imageClassify;
// 设置APPID/AK/SK
var APP_ID = "10834577";
var API_KEY = "1Pj4IF9ur4l8xqOuXgo3w4dY";
var SECRET_KEY = "y94P13Ez68F0lAmFSuhsMjVFaKqkbr6I";
let wxUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx2b370ab3723df6a4&secret=43743345568d9c077167a093b238d1de";
//获取access_token
var access;
request(wxUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        //输出返回的内容
        access = JSON.parse(body).access_token;
    }
});
var formData = {
    my_file: fs.createReadStream(__dirname + '/unicycle.jpg'),
};
request.post({
    url: 'http://service.com/upload',
    formData: formData
}, function (error, response, body) {
    if (!error && response.statusCode == 200) {}
})
// var formData = {
//     my_file: fs.createReadStream(__dirname + '/unicycle.jpg'),
// };
//图片内容安全过滤
function imgCheck(formData) {

    return new Promise((resolve, reject) => {
        let checkUrl = `https://api.weixin.qq.com/wxa/img_sec_check?access_token=${access}`;
        var option = {
            url: checkUrl,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            formData: formData
        };
        request(option, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //输出返回的内容
                resolve(body.errcode);
                // if (JSON.parse(body).errcode === 0) {

                // } else {
                //     resolve(false);
                // }
            }
        });
    })


}


// var acctoken=https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
// 新建一个对象，建议只保存一个对象调用服务接口
var client = new AipImageClassifyClient(APP_ID, API_KEY, SECRET_KEY);
/*
  菜品识别
*/
router.post('/dishDetect', (req, res) => {
    var form = new multiparty.Form();
    form.uploadDir = "./public/images";
    form.parse(req, function (err, fields, files) {
        if (err) {
            throw err;
        } else {
            //新图片名
            //  let avatar=userId+'.'+files.file[0].originalFilename.split('.')[1];
            let imgName = files.file[0].originalFilename;
            //同步重命名文件名
            fs.renameSync(files.file[0].path, "./public/images/" + files.file[0].originalFilename);
            var wxImg = "./public/images/" + imgName;
            var image = fs.readFileSync("./public/images/" + imgName).toString("base64");
            var formData = {
                // Pass a simple key-value pair
                my_field: 'my_value',
                my_file: fs.createReadStream(wxImg),
            };

            imgCheck(formData).then(function (resul) {
                if (resul === 0) {
                    // 调用菜品识别
                    client.dishDetect(image).then(function (result) {
                        res.send(JSON.stringify(result.result))
                    }).catch(function (err) {
                        // 如果发生网络错误
                        console.log(err);
                        res.send(err.errorType)
                    });
                } else {
                    res.send("0");
                }
            })




        }
    });

});
//导出路由
module.exports = router;