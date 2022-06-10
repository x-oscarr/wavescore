import express from "express";
var router = express.Router();

router.get('/', function (req, res) {
  const task = req.app.get('thread').activeTask;

  res.status(200).send({

  });
});

export default router;
