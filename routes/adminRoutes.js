import express from 'express'
import { adminVerification } from '../middleWares/adminAuth.js';
import { adminLogin, getAllUsers, getBanner, getAllDoctors, updateBannerDisc, dashboard, blockUser, updateBanner, unBlockUser, verifyDoctor, doctorsRequest, getDoctor, removeDoctor, appointments } from '../controller/adminController.js';
const router=express.Router();
import upload from "../utils/multer.js";

router.post("/login",adminLogin);

router.get("/allUsers",adminVerification,getAllUsers);

router.get("/allDoctors",adminVerification,getAllDoctors);

router.get("/getDoctor/:id",adminVerification,getDoctor)

router.get("/doctorsRequest",adminVerification,doctorsRequest)

router.get("/appointment",adminVerification,appointments)

router.get("/dashboard",adminVerification,dashboard)

router.put("/changeBanner",upload.single('image'),adminVerification,updateBanner);

router.get('/getBanner',adminVerification,getBanner);

router.post("/updateBannerDisc",adminVerification,updateBannerDisc);

router.put("/blockUser/:id",blockUser);

router.put("/unBlockUser/:id",unBlockUser);

router.put("/verifyDoctor/:id",verifyDoctor);

router.put("/rejectDoctor/:id",removeDoctor)

export default router;