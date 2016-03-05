var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser')
var fs = require('fs')
var mkdirp = require('mkdirp');
var ecstatic = require('ecstatic');
var multer  = require('multer');

var child_process = require('child_process')
var upload = multer({ dest: 'upload_temp/' })

var router = express();
var server = http.createServer(router);

var urlencodedParser = bodyParser.urlencoded({ extended: false });

function clearup(path) {
    child_process.execFile('/bin/rm', ['-rf', path], function (err, res) {
        if (err) console.error(err.stack ? err.stack : err)
    })
}
router.post('/', urlencodedParser, upload.single('content'), function (req, res, next) {
    var body = req.body;
    if (!body.path) return next();
    var savePath = path.resolve('/', body.path).replace(/^[\\\/]/, '');
    savePath = path.resolve(__dirname, 'public', savePath);
    console.log(body.mode, savePath);
    mkdirp(path.dirname(savePath), function (err) {
        if (err) return res.status(500).end(err.toString());
        if (!body.mode) {
            if (!body.content && !req.file) return next()
            if (body.content) {
                fs.writeFile(savePath, body.content, function (err) {
                    if (err) return res.status(500).end(err.toString());
                    res.end('success')
                })
            } else {
                fs.rename(req.file.path, savePath, function (err) {
                    if (err) return res.status(500).end(err.toString());
                    clearup(req.file.path);
                    res.end('success')
                })
            }
        } else if (body.mode === 'append'){
            if (!body.content && !req.file) return next()
            
            if (body.content) {
                fs.appendFile(savePath, '\r\n' + body.content, function (err) {
                    if (err) return res.status(500).end(err.toString());
                    res.end('success')
                })
            } else {
                var sourceStream = fs.createReadStream(req.file.path);
                var targetStream = fs.createWriteStream(savePath, {'flags': 'a+'});
                sourceStream.pipe(targetStream);
                var ended = false;
                sourceStream.on('error', function (err) {
                    if (!ended) res.status(500).end(err.toString());
                    ended = true;
                    clearup(req.file.path);
                })
                targetStream.on('error', function (err) {
                    if (!ended) res.status(500).end(err.toString());
                    ended = true;
                    clearup(req.file.path);
                })
                sourceStream.on('end', function () {
                    if (!ended) res.end('success')
                    ended = true;
                    clearup(req.file.path);
                })
            }
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