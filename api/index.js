const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors=require("cors")
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const router = express.Router();
const path = require("path");

dotenv.config();
app.use(cors())
mongoose.set('strictQuery', true);
mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);

app.use("/images", express.static(path.join(__dirname, "public/images")));

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

const storage = multer.diskStorage({
  destination: (req, file , cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb( null , req.body.name);
  },
});

const upload = multer({ storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/posts", postRoute);


//Deployment
const __dirname1 = path.resolve()
if (process.env.NODE_ENV === 'production') {
	app.use( express.static( path.join( __dirname1, '../client/build' ) ) )

	app.get( '*', (request, response) => {
		response.sendFile( path.resolve( __dirname1, "../client", "build", "index.html" ) )
	} )
} else {
	app.get( "/", (request, response) => {
		response.json( {message: "Server is Up"} );
	} );
}

const PORT=process.env.PORT||8800
app.listen(PORT, () => {
  console.log("Backend server is running!");
});