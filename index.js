var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser')
var fs = require('fs')
var mkdirp = require('mkdirp');
var ecstatic = require('ecstatic');

var router = express();
var server = http.createServer(router);

var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.post('/', urlencodedParser, function (req, res, next) {
    var body = req.body;
    if (!body.path) return next();
    var savePath = path.resolve('/', body.path).replace(/^[\\\/]/, '');
    savePath = path.resolve(__dirname, 'public', savePath);
    mkdirp(path.dirname(savePath), function (err) {
        if (err) return res.status(500).end(err.toString());
        if (!body.mode) {
            if (!body.content) return next()
            fs.writeFile(savePath, body.content, function (err) {
                if (err) return res.status(500).end(err.toString());
                res.end('success')
            })
        } else if (body.mode === 'append'){
            if (!body.content) return next()
            fs.appendFile(savePath, '\r\n' + body.content, function (err) {
                if (err) return res.status(500).end(err.toString());
                res.end('success')
            })
        } else if (body.mode === 'delete'){
            fs.unlink(savePath, function (err) {
                if (err) return res.status(500).end(err.toString());
                res.end('success')
            })
        }
    });
})
router.use(ecstatic({ root: path.resolve(__dirname, 'public')}));


server.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", function(){
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});