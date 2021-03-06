const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require("../models/index");
const express = require('express');
const router = express.Router();

// create a user and auto log in
router.post('/', async (req, res) => {
  const username = req.body.username;

  let user = await db.User.findOne({
  	where: {
  		username,
  	},
  });
  if (user) return res.status(400).json('User already registered.');

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);
  
  user = await db.User.create({
  	username,
  	password,
  });

  // token expires in 3 days
  const exp = Date.now() + 4320000;
  const token = jwt.sign({ id: user.id, exp, }, process.env.jwtPrivateKey);
  res.header('x-auth-token', token).json({ username: user.username });
});

module.exports = router;