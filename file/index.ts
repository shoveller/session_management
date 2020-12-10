import express from 'express';
import session from 'express-session';
import sessionFileStore from 'session-file-store';
import cookieParser from 'cookie-parser'

// https://dev.to/chris927/extending-express-types-with-typescript-declaration-merging-typescript-4-3jh
declare module "express-session" {
	interface Session {
		num?: number;
	}
}

// express 인스턴스 설정
const app = express()

// 쿠키 파서 미들웨어 초기화
app.use(cookieParser())

// 스토어 인스턴스 초기화
const FileStore = sessionFileStore(session)
const store = new FileStore()

const oneSecond = 1000
const oneMinute = oneSecond * 60

// 세션 스토어 초기화
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	store,
	cookie: {
		maxAge: oneMinute
	}
}))

// 라우터 초기화
app.get('/', (req, res) => {
	console.log(req.sessionID, req.session);
	const { num = 0 } = req.session;
	const body = { num: num + 1 }

	return res.json(body)
})

// 서버 실행
app.listen(3000, () => console.log('started at 3000 port'))
