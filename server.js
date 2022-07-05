const express = require('express');

const app = express();
const bodyParser= require('body-parser') ;
app.use(bodyParser.urlencoded({extended: true})) ;
const MongoClient = require('mongodb').MongoClient;

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.set('views','./views');
app.set('view engine', 'ejs'); 

app.use('/public',express.static('public'))
var id;
var db;
MongoClient.connect('mongodb+srv://admin:james@cluster0.ujzjm.mongodb.net/?retryWrites=true&w=majority', function(에러,client){
    if(에러) {return console.log(에러)}

    db=client.db('filelist');

app.listen(8080, function() {
       console.log('listening on 8080')
     });
})

app.get('/', function(요청,응답){
    응답.render('index.ejs')
});

app.get('/write', function (요청, 응답) {
  console.log(요청.user);
응답.render('write.ejs')
})

app.get('/addlist', function (요청, 응답) {
  console.log(요청.user);
응답.render('addlist.ejs')
})

//데이타 list 해 주게 하려면
app.get('/list', function(요청, 응답){
    db.collection('filelist').find().toArray(function(에러,결과){
        console.log(결과);
        응답.render('list.ejs', {filelists: 결과});
    });
});

app.get('/filelist', function(요청, 응답){
  db.collection('filelist').find().toArray(function(에러,결과){
      console.log(결과);
      응답.render('filelist.ejs', {filelists: 결과});
  });
});

app.get('/detail/:id', function(요청,응답) {
    db.collection('post').findOne({_id: parseInt(요청.params.id)}, function(에러,결과){응답.render('detail.ejs', {data: 결과})
})
})

app.get('/edit/:id', function(요청, 응답){
    db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러,결과){
        응답.render('edit.ejs',{ post : 결과})
    })
})

app.put('/edit', function(요청, 응답){
    db.collection('post').updateOne( {_id : parseInt(요청.body.id)}, {$set : { 제목 : 요청.body.title, 날짜 : 요청.body.date }}, function(){
      console.log('수정완료')
      응답.redirect('/list') 
    })
  });

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 

app.get('/login', function(요청,응답){
    응답.render('login.ejs')
});


app.post('/login', passport.authenticate('local', {failureRedirect : '/fail'}), function(요청, 응답){ 

  응답.redirect('/mypage') 
});

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)

    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.pw) {
     
      return done(null, 결과)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));
// 세션데이터 만들고 세션아이디 발급해서 쿠키로 보내주기
passport.serializeUser(function (user, done) {
  done(null, user.id)
});
//인증방식임
passport.deserializeUser(function (아이디, done) {
  db.collection('login').findOne({ id: 아이디 }, function (에러, 결과) {
    done(null, 결과)
  })
}); 

app.get('/mypage', 로그인했니, function(요청,응답){
 
  응답.render('mypage.ejs', {사용자: 요청.user})
})


  app.post('/register', function(요청, 응답){
    db.collection('login').insertOne({id: 요청.body.id, pw: 요청.body.pw }, function( 에러,결과){
      응답.redirect('/login')
    })
  })

  app.post('/add', function (요청, 응답) {
    console.log(요청.body)
    응답.send('전송완료');
    db.collection('counter').findOne({ name: '게시물갯수' }, function (에러, 결과) {
      console.log(결과)
      var 총게시물갯수 = 결과.totalPost;
      var _id = 결과._id
      var 저장할거 = { _id: 총게시물갯수 + 1, 작성자: 요청.id , 제목: 요청.body.title, 날짜: 요청.body.date }

      db.collection('post').insertOne(저장할거 , function (에러, 결과) {
        console.log('저장완료')

        db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (에러, 결과) {
          if (에러) { return console.log(에러) }
        })
      });

    });
  });

  app.post('/addurl', function (요청, 응답) {
    console.log(요청.body)
    응답.send('전송완료');
    db.collection('counter').findOne({ name: 'indexNumber' }, function (에러, 결과) {
      console.log(결과)
      var indexNumber = 결과.totalPost;
      var _id = 결과._id
      var 저장할거 = { id: indexNumber + 1, title: 요청.body.title, url: 요청.body.url, cat: 요청.body.cat }

      db.collection('filelist').insertOne(저장할거 , function (에러, 결과) {
        console.log('저장완료')

        db.collection('counter').updateOne({ name: 'indexNumber' }, { $inc: { totalPost: 1 } }, function (에러, 결과) {
          if (에러) { return console.log(에러) }
        })
      });

    });
  });

  app.delete('/delete', function(요청,응답){
    console.log(요청.body);
    요청.body._id=parseInt(요청.body._id);

    var 삭제할데이터={_id:요청.body._id, 작성자 : 요청.user._id}
    //요청.body에 게시물 번호 db에서 찾아서 삭제해주세요
    db.collection('post').deleteOne(삭제할데이터, function(에러,결과){
    console.log('삭제완료');
    if(에러){console.log(에러)}
    응답.status(200).send({message : '성공햇습니다'});
})
});

function 로그인했니(요청,응답,next){
  console.log(요청.user)
  if(요청.user){
    next()
  } else {
    응답.send('로그인 안 되었는데요')
  }
}