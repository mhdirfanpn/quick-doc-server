import Doctor from "../model/doctor.js";
import User from "../model/user.js"
import Session from "../model/session.js";
import Appointment from "../model/appointment.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";

export const registerDoctor = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      number,
      date,
      experience,
      register,
      specialization,
    } = req.body;

    if (
      !email ||
      !password ||
      !fullName ||
      !number ||
      !date ||
      !experience ||
      !register ||
      !specialization
    ) {
      return res.status(401).json({ message: "all fields are required" });
    }

    const doctorDetails = await Doctor.findOne({ email });

    if (doctorDetails) {
      res
        .status(200)
        .json({ success: false, message: "Doctor already Registered" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newDoctor = await Doctor.create({
        fullName,
        email,
        password: hashedPassword,
        number,
        date,
        experience,
        register,
        specialization,
      });
      res.status(200).json({
        success: true,
        message: "success new doctor created",
        doctor: newDoctor,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ message: "all fields are required" });
    }

    const doctorDetails = await Doctor.findOne({ email });
    if (doctorDetails) {
      if (!doctorDetails.isVerified) {
        return res
          .status(200)
          .json({ success: false, message: "doctor is not verified" });
      }

      const passMatch = await bcrypt.compare(password, doctorDetails.password);
      if (!passMatch) {
        return res
          .status(200)
          .json({ success: false, message: "Doctor Password is invalid" });
      }

      const token = jwt.sign(
        { id: doctorDetails._id },
        process.env.DOC_JWT_SECRET,
        { expiresIn: "30d" }
      );
      res.status(200).json({ success: true, token, doctorDetails });
    } else {
      res.status(200).json({ success: false, message: "Doctor not found" });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const doctorDetails = async (req, res) => {
  try {
    const doctorDetails = await Doctor.findOne({ _id: req.params.id });
    res
      .status(200)
      .json({ message: "data sent successfully successfully", doctorDetails });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const updateDetails = async (req, res) => {
  try {
    const doctorDetails = await Doctor.findOneAndUpdate(
      { _id: req.params.id },
      {
        fullName: req.body.fullName,
        email: req.body.email,
        number: req.body.number,
        experience: req.body.experience,
      }
    );
    if (!doctorDetails) {
      return res
        .status(200)
        .json({ success: false, message: "Doctor not found" });
    }
    res
      .status(200)
      .json({ message: "doctor data updated successfully", doctorDetails });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const password = req.body.newPassword;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await Doctor.findOneAndUpdate(
        { _id: req.params.id },
        {
          password: hashedPassword,
        }
      );

      return res
        .status(200)
        .json({ message: "doctor password is updated successfully" });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const user = await Doctor.findByIdAndUpdate(req.params.id, {
      $set: {
        profilePic: result.secure_url,
      },
    });
    const pic = user.profilePic;
    return res
      .status(200)
      .json({ message: "doctor image updated successfully", pic });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const session = async (req, res) => {
  try {
    const id = req.params.id;
    const session = await Session.find({ doctorId: id });
    res.json({session});
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const activeSession = async (req, res) => {
  // const currentISODate = new Date();
  // currentISODate.setHours(currentISODate.getHours()-2);
  const currentISODate = new Date();
  currentISODate.setHours(currentISODate.getHours()+5);
 // currentISODate.setMinutes(currentISODate.getMinutes());
  try {
    const session = await Session.findOne({
      doctorId: req.params.id,
      startTime: { $lte: currentISODate },
      endTime: { $gte: currentISODate },
    });
    if (session) {
      res.json(session);
    } else {
      res.json("no session");
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const setLink = async (req, res) => {
  const currentISODate = new Date();
  currentISODate.setHours(currentISODate.getHours() +5);
  currentISODate.setMinutes(currentISODate.getMinutes() + 30);

  try {
    const session = await Session.findOne({
      doctorId: req.params.id,
      startTime: { $lte: currentISODate },
      endTime: { $gte: currentISODate },
    });
    if (session) {
      const data = req.body.data;
      await session.updateOne({
        $set: { link: data },
      });
    } else {
      res.json("no session");
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const timeSlot = async (req, res) => {
  try {
    const timings = req.body.selectedTimings;
    const uniqueTimings = [...new Set(timings.map((timing) => timing.time))];
    // Sort the unique times in ascending order
    const sortedTimings = uniqueTimings.sort((a, b) => {
      const aTime = new Date(`2000-01-01 ${a}`);
      const bTime = new Date(`2000-01-01 ${b}`);
      return aTime - bTime;
    });
    let arr = [];
    (arr.date = req.body.selectedDate), (arr.timings = sortedTimings);

    const appointmentData = {
      date: req.body.selectedDate,
      timings: sortedTimings,
    };

    const exist = await Appointment.findOne({
      doctor: req.body.id,
      "timeAndDate.date": req.body.selectedDate,
    });

    if (exist) {
      const updated = await Appointment.findOneAndUpdate(
          { doctor: req.body.id, "timeAndDate.date": req.body.selectedDate },
          { $set: { "timeAndDate.timings": sortedTimings } }
        );
        res.json("updated");
    }
    else{
      const created = await Appointment.create({
        doctor: req.body.id,
        timeAndDate: appointmentData,
      });
      res.json("created");
    }
    
  }  catch (err) {
    res.status(500).json({ error: err });
  }
};


export const getUser = async (req, res) => {
  try {
   const user = await User.findById(req.params.id)
   console.log(user);
   res.json(user)
  }  catch (err) {
    res.status(500).json({ error: err });
  }
};


