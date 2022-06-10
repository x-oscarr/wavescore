import express from "express";
var router = express.Router();

router.get('/', function (req, res) {
    res.status(204).send(null)
});

router.post('/start', function (req, res) {
    req.app.get('thread').start();
    res.status(200).send('started');
});

router.post('/stop', function(req, res, next) {
    req.app.get('thread').stop()
        .then(() => res.status(200).send('stopped'))
        .catch(e => res.status(503).send(e));
});

router.post('/skip', function (req, res) {
    req.app.get('thread').skip();
    res.status(204).send(null)
});

router.get('/healthz', function (req, res) {
    res.status(204).send(null)
});

export default router;