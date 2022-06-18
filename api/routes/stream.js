import express from "express";
var router = express.Router();

router.get('/', function (req, res) {
    res.status(204).send({

    });
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

router.post('/next', function (req, res) {
    req.app.get('thread').next();
    res.status(204).send(null)
});

router.post('/prev', function (req, res) {
    req.app.get('thread').prev();
    res.status(204).send(null)
});

router.post('/repeat', function (req, res) {
   req.app.get('thread').repeat();
   res.status(204).send(null);
});

router.head('/healthz', function (req, res) {
    res.status(204).send(null)
});

export default router;