import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./router";
import { requestLogger } from "../utils/requestLogger";
import { errorHandler, notFoundHandler } from "../middleware/errorHandler";
import docsRouter from "./docs";

const app = express();
app.set("trust proxy", 1); // 프록시 신뢰 설정

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://localhost:3000"
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
        preflightContinue: false,
        exposedHeaders: ["Content-Type", "Authorization", "Cookie", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
        optionsSuccessStatus: 204
    })
);

app.use(express.json()); // JSON 파싱 미들웨어
app.use(cookieParser()); // 쿠키 파싱 미들웨어
app.use(requestLogger); // 요청 로깅 미들웨어

app.use(router);
app.use(docsRouter);

app.use(errorHandler); // 전역 에러 핸들러
app.use(notFoundHandler); // 404 에러 핸들러

(async () => {
    const port = +(process.env.PORT ?? 8000);
    app.listen(port, "0.0.0.0", () => {
        console.log(`Server Start`);
        console.log(`http://localhost:${port}`);
    });
})();
