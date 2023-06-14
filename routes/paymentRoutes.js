import express from "express";
import {order, verifyPayment} from "../controller/paymentController.js";
const router = express.Router();

router.post('/orders',order);

router.post('/verify',verifyPayment);

export default router;