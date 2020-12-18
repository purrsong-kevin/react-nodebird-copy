const bcrypt = require('bcrypt');
const passport = require('passport');
const express = require('express');
const router = express.Router();

const { Op } = require('sequelize');
const { User, Post, Image, Comment } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

router.get('/', async (req ,res ,next) => {   // GET /user
  try {
    if (req.user) {
      const fullUserWithoutPassword = await User.findOne({
        where: { id: req.user.id },
        attributes: {
          exclude: ['password']
        },
        include: [{
          model: Post,
          attributes: ['id']
        }, {
          model: User,
          as: 'Followings',
          attributes: ['id']
        }, {
          model: User,
          as: 'Followers',
          attributes: ['id']
        }]
      });
      return res.status(200).json(fullUserWithoutPassword);
    }
    else {
      res.status(200).json(null);
    }
  }
  catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/followers', isLoggedIn, async (req, res, next) => {   // GET /user/followers
  try {
    const user = await User.findOne({ where: { id: req.user.id }});
    if (!user) {
      return res.status(403).send('없는 사람을 찾으려고 하시네요?');
    }
    const followers = await user.getFollowers({
      limit: parseInt(req.query.limit, 10)
    });
    return res.status(200).json(followers);
  }
  catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/followings', isLoggedIn, async (req, res, next) => {   // GET /user/followings
  try {
    const user = await User.findOne({ where: { id: req.user.id }});
    if (!user) {
      return res.status(403).send('없는 사람을 찾으려고 하시네요?');
    }
    const followings = await user.getFollowings({
      limit: parseInt(req.query.limit, 10)
    });
    return res.status(200).json(followings);
  }
  catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/:userId', async (req ,res ,next) => {   // GET /user/1
  try {
    const fullUserWithoutPassword = await User.findOne({
      where: { id: req.params.userId },
      attributes: {
        exclude: ['password']
      },
      include: [{
        model: Post,
        attributes: ['id']
      }, {
        model: User,
        as: 'Followings',
        attributes: ['id']
      }, {
        model: User,
        as: 'Followers',
        attributes: ['id']
      }]
    });
    if (fullUserWithoutPassword) {
      const data = fullUserWithoutPassword.toJSON();
      data.Posts = data.Posts.length;   // 개인정보 침해 예방
      data.Followings = data.Followings.length;
      data.Followers = data.Followers.length;
      return res.status(200).json(data);
    }
    else {
      return res.status(404).send('존재하지 않는 사용자입니다.');
    }
  }
  catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/:userId/posts', async (req, res, next) => {   // GET /user/1/posts
  try {
    const where = { UserId: req.params.userId };
    if (parseInt(req.query.lastId, 10)) {   // 초기 로딩이 아닐 때
      where.id = { [Op.lt]:  parseInt(req.query.lastId, 10) };
    }
    const posts = await Post.findAll({
      where,    // 라스트 아이디 방식
      // offset: 0,    // 게시글 추가 삭제시 문제 발생, 실무에서 잘 안씀
      limit: 10,
      order: [
        ['createdAt', 'DESC'],
        [Comment, 'createdAt', 'DESC']
      ],
      include: [{
        model: User,
        attributes: ['id', 'nickname']
      }, {
        model: Image
      }, {
        model: Comment,
        include: [{
          model: User,
          attributes: ['id', 'nickname']
        }]
      }, {
        model: User,
        as: 'Likers',
        attributes: ['id']
      }, {
        model: Post,
        as: 'Retweet',
        include: [{
          model: User,
          attributes: ['id', 'nickname']
        }, {
          model: Image
        }]
      }]
    });
    return res.status(200).json(JSON.parse(JSON.stringify(posts)));
  }
  catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(error);
      return next(err);
    }
    if (info) {
      console.error(info);
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      const fullUserWithoutPassword = await User.findOne({
        where: { id: user.id },
        attributes: {
          exclude: ['password']
        },
        include: [{
          model: Post,
          attributes: ['id']
        }, {
          model: User,
          as: 'Followings',
          attributes: ['id']
        }, {
          model: User,
          as: 'Followers',
          attributes: ['id']
        }]
      });
      return res.status(200).json(fullUserWithoutPassword);
    });
   })(req, res, next);
});    // POST /user/login

router.post('/', isNotLoggedIn, async (req, res, next) => {    // POST /user/
  try {
    const exUser = await User.findOne({
      where: {
        email: req.body.email
      }
    });
    if (exUser) {
      return res.status(403).send('이미 사용중인 아이디입니다.');
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 12);  // 뒤에 숫자가 높을수록 보안 수준이 높은 암호화를 함, 대신 속도가 느려질 수 있음 (보통 10-13 사이로 설정)
    await User.create({
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword
    });
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3060');    // 모든 서버는 '*';
    return res.status(201).send('ok');
  }
  catch (error) {
    console.error(error);
    next(error);    // status 500
  }
});

router.post('/logout', isLoggedIn, (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.send('ok');
});

router.patch('/nickname', isLoggedIn, async (req, res, next) => {
  try {
    await User.update({
      nickname: req.body.nickname
    }, {
      where: { id: req.user.id }
    });
    return res.status(200).json({ nickname: req.body.nickname });
  }
  catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch('/:userId/follow', isLoggedIn, async (req, res, next) => {   // PATCH /user/1/follow
  try {
    const user = await User.findOne({ where: { id: req.params.userId }});
    if (!user) {
      return res.status(403).send('없는 사람을 팔로우하려고 하시네요?');
    }
    await user.addFollowers(req.user.id);
    return res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  }
  catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:userId/follow', isLoggedIn, async (req, res, next) => {   // DELETE /user/1/follow
  try {
    const user = await User.findOne({ where: { id: req.params.userId }});
    if (!user) {
      return res.status(403).send('없는 사람을 언팔로우하려고 하시네요?');
    }
    await user.removeFollowers(req.user.id);
    return res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  }
  catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/follower/:userId', isLoggedIn, async (req, res, next) => {   // DELETE /user/follower/1
  try {
    const user = await User.findOne({ where: { id: req.params.userId }});
    if (!user) {
      return res.status(403).send('없는 사람을 차단하려고 하시네요?');
    }
    await user.removeFollowings(req.user.id);
    return res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  }
  catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
