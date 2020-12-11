/**
 * node.js 모듈은 모두 commonJs 방식을 따르기 때문에, `tsconfig.json` 에 `esModuleInterop: true` 를 추가해 줘야만 default import가 가능하다.
 */
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser'
import expressMysqlSession, { Schema, Options } from 'express-mysql-session';

/**
 * 세션에 새로운 프로퍼티를 추가하려면 declaration merging을 해 주어야 함
 */
declare module 'express-session' {
	interface SessionData {
		num?: number;
	}
}

declare module 'express-mysql-session' {
	interface Options {
		host?: string;
		port?: number;
		user?: string;
		password?: string;
		database?: string;
		clearExpired?: boolean;
		checkExpirationInterval?: number;
		expiration?: number;
		createDatabaseTable?: boolean;
		connectionLimit?: number;
		endConnectionOnClose?: boolean;
		charset?: string;
		schema?: Partial<Schema>;
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

const oneSecond = 1000
const oneMinute = oneSecond * 60
const oneHour = oneMinute * 60
const oneDay = oneHour * 24
const options: Options = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'password',
	database: 'session',
	charset: 'utf8mb4_bin',
	clearExpired: true,
	checkExpirationInterval: 15 * oneMinute,
	expiration: oneDay,
	schema: {
		tableName: 'sessions',
		columnNames: {
			session_id: 'session_id',
			expires: 'expires',
			data: 'data'
		}
	}
}

/**
 * 스토어 인스턴스 초기화
 */
const MySQLStore = expressMysqlSession(session as any)
const store = new MySQLStore(options)

/**
 * 세션 스토어 초기화
 */
app.use(session({
	secret: 'keyboard cat', // 세션 암호화에 사용하는 키값
	name: 'cat', // 웹 브라우저에서의 세션 이름(default: connect.sid)
	resave: false, // true로 설정하면, 값이 바뀌지 않더라도 새로저장
	saveUninitialized: true, // 접속후에 바로 세션을 생성하는가?
	store,
	cookie: { // 클라이언트 쿠키
		path: '/', // 쿠키의 경로
		httpOnly: true, // 이 쿠키는 자바스크립트로 접근할 수 없는가?
		secure: false, // 브라우저에서 https로만 쿠키를 전송하는가?
		maxAge: oneMinute, // 만료 기간
		domain: 'localhost' // 크키의 도메인
	}
}))

/**
 * 라우터 초기화
 */
app.get('/', (req, res) => {
	console.log('세션 생성됨',req.sessionID, req.session);
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
