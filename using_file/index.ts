/**
 * node.js 모듈은 모두 commonJs 방식을 따르기 때문에, `tsconfig.json` 에 `esModuleInterop: true` 를 추가해 줘야만 default import가 가능하다.
 */
import express from 'express';
import session from 'express-session';
import sessionFileStore from 'session-file-store';
import cookieParser from 'cookie-parser'

/**
 * 세션에 새로운 프로퍼티를 추가하려면 declaration merging을 해 주어야 함
 */
declare module 'express-session' {
	interface SessionData {
		num?: number;
	}
}

/**
 * express 인스턴스 설정
 */
const app = express()

/**
 * 쿠키 파서 미들웨어 초기화
 */
app.use(cookieParser())

/**
 * 스토어 인스턴스 초기화
 */
const FileStore = sessionFileStore(session)
const store = new FileStore()

const oneSecond = 1000
const oneMinute = oneSecond * 60

/**
 * 세션 스토어 초기화
 */
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	store,
	cookie: {
		maxAge: oneMinute
	}
}))

/**
 * 라우터 초기화
 */
app.get('/', (req, res) => {
	console.log(req.sessionID, req.session);
	const {num = 0} = req.session;
	/**
	 * 세션을 보다 쉽게 구분할 수 있게 숫자 데이터를 추가해준다.
	 */
	req.session.num = num + 1
	const body = {num: req.session.num}

	return res.json(body)
})

/**
 * 서버 실행
 */
app.listen(3000, () => console.log('started at 3000 port'))
