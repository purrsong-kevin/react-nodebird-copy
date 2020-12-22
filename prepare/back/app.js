const express = require('express');
const passport = require('passport');
const passportConfig = require('./passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const hpp = require('hpp');
const helmet = require('helmet');

const app = express();
const db = require('./models');
const { frontUrl } = require('./config/frontUrl');

db.sequelize.sync()
  .then(() => {
    console.log('db 연결 성공');
  })
  .catch(console.error);

dotenv.config();
passportConfig();

if (process.env.NODE_ENV = 'production') {
  app.use(morgan('combined'));
  app.use(hpp());
  app.use(helmet());
  app.use(cors({
    origin: frontUrl,
    credentials: true   // 쿠키 전달 여부
  }));
}
else {
  app.use(morgan('dev'));
  app.use(cors({
    origin: true,
    credentials: true   // 쿠키 전달 여부
  }));
}

app.use('/', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  saveUninitialized: false,
  resave: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
    domain: process.env.NODE_ENV === 'production' && '.purrsong-dev.com'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

/*
  app.get => 가져오다
  app.post => 생성하다
  app.put => 전체 수정
  app.delete => 제거
  app.patch => 부분 수정
  app.options => 찔러보기
  app.head => 헤더만 가져오기 (헤더/바디)
*/

const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');
const userRouter = require('./routes/user');
const hashtagRouter = require('./routes/hashtag');

app.get('/', (req, res) => {
  res.send('Hello Express');
});

app.use('/post', postRouter);
app.use('/posts', postsRouter);
app.use('/user', userRouter);
app.use('/hashtag', hashtagRouter);

app.listen(3065, () => {
  console.log('Server listen 3065!');
});
