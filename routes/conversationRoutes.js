import express from "express";
const router = express.Router();
import Conversation from "../model/conversation.js";
import User from "../model/user.js";
import Doctor from "../model/doctor.js";


router.post("/", async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $all: [req.body.senderId, req.body.receiverId] },
    });
    if (conversations[0]) {
      return res.json(conversations[0]);
    }
    if(req.body.senderId==null || req.body.receiverId==null){
      return res.json(conversations[0]); 
    }
    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });
      const savedConversation = await newConversation.save();
      res.status(200).json(savedConversation);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/chatUser/:id", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/chatDoctor/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.params.id });
    res.status(200).json(doctor);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
