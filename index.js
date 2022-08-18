
const express = require('express');
const app = express();
const port = 5000;
const mongoose = require('mongoose');
const config = require('./config/key');
const { User } = require("./models/User");

//application/x-www-from-urlencoded 데이터 분석 후 가져오기
app.use(express.urlencoded({ extended: true }));
//applicateon/json "
app.use(express.json());


mongoose
    .connect(config.mongoURI, {})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));


app.get('/', (req, res) => res.send('hello world'));

app.post('/register', (req, res) => {
    const user = new User(req.body);
    //몽고DB에서 받아오는 메소드
    user.save((err, doc) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        });
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));