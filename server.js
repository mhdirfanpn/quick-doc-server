import express from "express";
import cors from 'cors'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import dotenv from 'dotenv'
import dbConnection from './config/db.js'
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import doctorRoutes from './routes/doctorRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import conversationRoutes from './routes/conversationRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import http from 'http';
import { Server } from 'socket.io'

const app = express();
dotenv.config();


const server = http.createServer(app);
const io = new Server(server,
  { cors: { origin: ["https://quickdoc.online", "https://www.quickdoc.online", "https://quick-doc-client.vercel.app/", "https://quickdoc.irfanpn.online"] } }
);
// cors: {
//   origin: "https://www.quickdoc.online"
// },
// const io = new Server(appServer,) 


app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200
}));

app.use(morgan("dev"))
app.use(bodyParser.json());

app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))

app.use('/api', userRoutes)
app.use('/api/doc', doctorRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/conversation', conversationRoutes)
app.use('/api/message', messageRoutes)

app.get('*', (req, res) => {
  res.status(404).send("PAGE NOT FOUND")
})

try {

  let users = [];
  const addUser = (userId, socketId) => {
    !users.some((user) => user.userId == userId) &&
      users.push({ userId, socketId });
  };

  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
  };

  const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
  };

  io.on("connection", (socket) => {
    //when connect

    //take userId and socketId from user
    socket.on("addUser", (userId) => {
      try {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
      } catch (error) {
        console.log("something went wrong");
      }
    });

    //send and get messages
    socket.on("sendMessage", ({ senderId, recieverId, text }) => {
      try {
        const user = getUser(recieverId);
        io.to(user.socketId).emit("getMessage", {
          senderId,
          text,
        });
      } catch (error) {
        // res.json("something went wrong")
        console.log("something went wrong");
      }
    });

    //when disconnect
    socket.on("disconnect", () => {
      try {
        removeUser(socket.id);
        io.emit("getUsers", users);
      } catch (error) {
        console.log("something went wrong");
        // res.json("something went wrong")
      }
    });
  });

} catch (error) {
  console.log("something went wrong");
  // res.json("something went wrong")
}

dbConnection().then(() => {
  server.listen(process.env.PORT, () => console.log(`SERVER STARTED AT PORT:700`))
})