import express from "express";
import path from "path";                
import UserRRoutes from "./component/route";
import swaggerUi from "swagger-ui-express";
import specs from "./swagger.config";
import morgan from "morgan";
import cors from 'cors';
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import http from "http";
dotenv.config();

const app = express();
const server = http.createServer(app);

// 1️⃣ Serve /public as static at the web root:
app.use(express.static(path.join(__dirname, '../public')));

// 2️⃣ (Optional) fallback to index.html for an SPA:
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(
  cors({
    origin: "*",
    methods: ["GET","POST","PUT","DELETE","PATCH"],
    allowedHeaders: ["Content-Type","Authorization"],
  })
);

app.options("*", cors());

app.use(
  session({
    secret: process.env.GOOGLE_SECRET2 as string,
    resave: false,             // don’t save session if unmodified
    saveUninitialized: false,  // don’t create session until something is stored
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod
      maxAge: 1000 * 60 * 60 * 24,                   // e.g. 1 day
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// API routes
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to Multi-Factor Authentication App' });
});
app.use("/api/Users", UserRRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

export default app;
export { server };
