import express from "express";
import { registerUser, userLogin, getBanner, userDetails,getTime,cancelAppointment, updateDetails, session, cancelSession, updatePassword, updateProfileImage, otpLogin,availability, allDoctors, getDoctor, bookSession, appointment, activeSession} from "../controller/userController.js";
import upload from "../utils/multer.js";
import { verifyToken } from "../middleWares/userAuth.js";
import { isBlocked } from "../middleWares/authorize.js";
const router = express.Router();

router.post("/signup", registerUser);

router.post("/login",userLogin);

router.get('/otpLogin/:id',otpLogin);

router.get('/getBanner',getBanner);

router.get("/allDoctors",allDoctors)

router.get("/details/:id",verifyToken,isBlocked,userDetails)

router.put("/updateDetails/:id",verifyToken,isBlocked,updateDetails)

router.put("/updatePassword/:id",verifyToken,isBlocked,updatePassword);

router.put("/updateUserImage/:id",upload.single('image'),verifyToken,isBlocked,updateProfileImage);

router.get("/getDoctor/:id",verifyToken,isBlocked,getDoctor)

router.post('/book_session',verifyToken,isBlocked,bookSession);

router.post('/appointment',verifyToken,isBlocked,appointment);

router.post('/availability',verifyToken,isBlocked,availability);

router.get("/getSession/:id",verifyToken,isBlocked,session);

router.get("/getActiveSession/:id",verifyToken,isBlocked,activeSession);

router.get("/getTime",verifyToken,isBlocked,getTime);

router.put("/cancelSession",verifyToken,isBlocked,cancelSession);

router.put("/cancelAppointment",verifyToken,isBlocked,cancelAppointment);

export default router;
