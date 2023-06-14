import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Admin from "../model/admin.js";
import User from "../model/user.js";
import Doctors from "../model/doctor.js";
import Session from "../model/session.js";
import Banner from "../model/banner.js";
import { token } from "../validation/tokenValidate.js";
import cloudinary from "../utils/cloudinary.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(200)
        .json({ success: false, message: "All fields are required" });
    }

    const adminDetails = await Admin.findOne({ email });
    if (adminDetails) {
      const matchPassword = await bcrypt.compare(
        password,
        adminDetails.password
      );
      if (!matchPassword)
        return res
          .status(200)
          .json({ success: false, message: "Admin Password is not matched" });

      const adminToken = jwt.sign(
        { id: adminDetails._id },
        process.env.ADMIN_JWT_SECRET
      );
      token(adminToken);
      res.status(200).json({
        success: true,
        message: "Login success",
        adminToken,
        adminDetails,
      });
    } else {
      res
        .status(200)
        .json({ success: false, message: "admin email is not matched" });
    }
  } catch (err) {
    res.status(400).json({ error: err, message: "server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(200).json({ message: "no users found" });
    }
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctors.find({ isVerified: true });
    if (!doctors) {
      return res.status(200).json({ message: "no doctors found" });
    }
    res.status(200).json(doctors);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const doctorsRequest = async (req, res) => {
  try {
    const adminAuthHeader = req.header("Authorization");
    const doctors = await Doctors.find({ isVerified: false });
    if (!doctors) {
      return res.status(200).json({ message: "no doctors found" });
    }
    res.status(200).json(doctors);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const blockUser = async (req, res) => {
  try {
    const users = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        isBlocked: true,
      }
    );
    res.status(200).json({ message: "user is blocked successfully", users });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const unBlockUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        isBlocked: false,
      }
    );
    res.status(200).json({ message: "user is unblocked successfully", user });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctors.findOneAndUpdate(
      { _id: req.params.id },
      {
        isVerified: true,
      }
    );
    res
      .status(200)
      .json({ message: "doctor is verified successfully", doctor });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const removeDoctor = async (req, res) => {
  try {
    const doctor = await Doctors.findOneAndRemove({ _id: req.params.id });
    res.status(200).json({ message: "doctor removed successfully", doctor });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctors.findOne({ _id: req.params.id });
    res.status(200).json({ message: "doctor data sent success", doctor });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const appointments = async (req, res) => {
  try {
    const appointments = await Session.find();
    res.status(200).json({ message: "data sent success", appointments });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};


export const dashboard = async (req, res) => {
  try {
   const users = await User.countDocuments()
   const doctors = await Doctors.countDocuments()
   const appointmnets = await Session.countDocuments()
   const total = await Session.aggregate([
    {
      $project: {
        planInt: { $toInt: "$plan" }
      }
    },
    {
      $group: {
        _id: null,
        totalRate: { $sum: "$planInt" }
      }
    }
  ]);
  const revenue = await Session.aggregate([
    {
      $addFields: {
        bookingDate: {
          $toDate: "$bookedDate"
        },
        planInt: {
          $toInt: "$plan"
        }
      }
    },
    {
      $group: {
        _id: {
          $month: "$bookingDate"
        },
        revenue: {
          $sum: "$planInt"
        }
      }
    },
    {
      $project: {
        month: "$_id",
        revenue: 1,
        _id: 0
      }
    },
    {
      $sort: {
        month: 1
      }
    }
  ])
   res.json({ users, doctors, total, appointmnets, revenue })
  } catch (err) {
    res.status(400).json({ error: err });
  }
};


export const updateBanner = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const filter = {}; // Empty object to match any document
    const update = {
      bannerPic: result.secure_url,
    };
    const options = { new: true, upsert: true }; // Set upsert to true to create a new document if it doesn't exist    
    const updatedBanner = await Banner.findOneAndUpdate(filter, update, options);
    return res
      .status(200)
      .json({ message: "banner updated successfully",updatedBanner });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};


export const getBanner = async (req, res) => {
  try {
    const bannerImage = await Banner.findOne()
    res.status(200)
      .json(bannerImage);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};


export const updateBannerDisc = async (req, res) => {
  try {
    const filter = {}; // Empty object to match any document
    const update = {
      description: req.body.text,
    };
    const options = { new: true, upsert: true }; // Set upsert to true to create a new document if it doesn't exist    
    const updatedBanner = await Banner.findOneAndUpdate(filter, update, options);
    return res
      .status(200)
      .json({ message: "banner discription updated successfully", updatedBanner});
  } catch (err) {
    res.status(400).json({ error: err });
  }
};