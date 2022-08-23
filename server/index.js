
const express = require('express');
const app = express();
const port = 5000;
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require("./models/User");

//application/x-www-from-urlencoded 데이터 분석 후 가져오기
app.use(express.urlencoded({ extended: true }));
//applicateon/json "
app.use(express.json());
app.use(cookieParser());


mongoose
    .connect(config.mongoURI, {})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));


app.get('/', (req, res) => res.send('hello world'));

app.get('/api/hello', (req, res) => {
    res.send("안녕하세요")
});

app.post('/api/users/register', (req, res) => {
    const user = new User(req.body);
    //몽고DB에서 받아오는 메소드
    user.save((err, doc) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        });
    });
});

app.post('/api/users/login', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "입력한 이메일에 해당하는 유저가 없습니다."
            })
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) {
                return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })
            } else {
                user.generateToken((err, user) => {
                    if (err) { return res.status(400).send(err) };
                    //쿠키, 로컬스토리지 등에 토큰 저장 가능하지만 여기서는 쿠키에 넣을것임
                    res.cookie("x_auth", user.token)
                        .status(200)
                        .json({ loginSuccess: true, userId: user._id });
                });
            }
        })
    })
})

app.get('/api/users/auth', auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    //미들웨어에서 가져옴
    User.findOneAndUpdate(
        { _id: req.user._id },
        { token: "" },
        (err, user) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).send({
                success: true
            })
        }
    )
})


app.listen(port, () => console.log(`Example app listening on port ${port}`));