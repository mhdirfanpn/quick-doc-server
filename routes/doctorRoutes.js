import express from "express";
import { registerDoctor, doctorLogin, doctorDetails, updateDetails ,getUser, updatePassword, updateProfileImage, setLink, timeSlot, session, activeSession} from "../controller/doctorController.js";
const router = express.Router();
import { verifyToken } from "../middleWares/doctorAuth.js";
import upload from "../utils/multer.js";

router.post("/signup",registerDoctor);

router.post("/login",doctorLogin);

router.get("/details/:id",verifyToken,doctorDetails)

router.put("/updateDetails/:id",verifyToken,updateDetails)

router.put("/updatePassword/:id",verifyToken,updatePassword);

router.put("/updateDoctorImage/:id",upload.single('image'),verifyToken,updateProfileImage);

router.post('/timeSlot',verifyToken,timeSlot);

router.get("/appointment/:id",verifyToken,session);

router.get("/getActiveSession/:id",activeSession);

router.put("/link/:id",setLink);

router.get("/getUser/:id",getUser)


export default router;