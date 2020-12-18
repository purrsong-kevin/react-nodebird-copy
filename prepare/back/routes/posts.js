const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();

const { Post, User, Image, Comment } = require('../models');

router.get('/', async (req, res, next) => {   // GET /posts
  try {
    const where = {};
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

module.exports = router;
