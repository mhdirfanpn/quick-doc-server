import User from "../model/user.js";
import Session from "../model/session.js";
import Doctor from "../model/doctor.js";
import Banner from "../model/banner.js";
import Appointment from "../model/appointment.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";
import moment from "moment";

export const registerUser = async (req, res) => {
  try {
    const { email, password, userName, number, date } = req.body;

    if (!email || !password || !number || !userName || !date) {
      return res.status(401).json({ message: "all fields are required" });
    }

    const userDetails = await User.findOne({ email });

    if (userDetails) {
      res
        .status(200)
        .json({ success: false, message: "User already Registered" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        userName,
        email,
        password: hashedPassword,
        number,
        date,
      });
      res.status(200).json({
        success: true,
        message: "success new user created",
        user: newUser,
      });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ message: "all fields are required" });
    }

    const userDetails = await User.findOne({ email });

    if (userDetails) {
      if (userDetails.isBlocked) {
        return res
          .status(200)
          .json({ success: false, message: "User is blocked" });
      }

      const passMatch = await bcrypt.compare(password, userDetails.password);

      if (!passMatch) {
        return res
          .status(200)
          .json({ success: false, message: "User Password is Invalid" });
      }

      const token = jwt.sign(
        {
          id: userDetails._id,
          name: userDetails.userName,
          email: userDetails.email,
          number: userDetails.number,
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
      res.status(200).json({ success: true, token, userDetails });
    } else {
      res.status(200).json({ success: false, message: "User not found" });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const otpLogin = async (req, res) => {
  try {
    const userDetails = await User.findOne({ number: req.params.id });

    if (userDetails) {
      const token = jwt.sign(
        { id: userDetails._id, name: userDetails.userName },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
      return res.status(202).json({ message: "user exist", token });
    }
    res.status(203).json({ message: "mobile no. mismatch" });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const getBanner = async (req, res) => {
  try {
    const bannerImage = await Banner.findOne();
    res.status(200).json(bannerImage);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const userDetails = async (req, res) => {
  try {
    const userDetails = await User.findOne({ _id: req.params.id });
    res
      .status(200)
      .json({ message: "user data sent successfully", userDetails });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const updateDetails = async (req, res) => {
  try {
    const userDetails = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        userName: req.body.userName,
        email: req.body.email,
        number: req.body.number,
      }
    );
    if (!userDetails) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "user data updated successfully", userDetails });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const password = req.body.newPassword;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          password: hashedPassword,
        }
      );

      return res
        .status(200)
        .json({ message: "user password is updated successfully" });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    const user = await User.findByIdAndUpdate(req.params.id, {
      $set: {
        profilePic: result.secure_url,
      },
    });
    const pic = user.profilePic;
    return res
      .status(200)
      .json({ message: "user image updated successfully", pic });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const allDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    if (doctors) {
      return res
        .status(200)
        .json({ message: "doctors data sent successfully", doctors });
    }

    res.status(400).json({ message: "their is no doctor" });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.params.id });
    res.status(200).json({ message: "doctor data sent success", doctor });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const bookSession = async (req, res) => {
  try {
    const timeSlot = req.body.time;
    const sessionDate = req.body.date;
    const isoDate = moment(
      `${sessionDate} ${timeSlot}`,
      "YYYY-MM-DD h:mm A"
    ).toISOString();
    const twoHoursLater = moment(isoDate).add(2, "hours").toISOString();
    const currentISODate = moment().toISOString();
    const formattedDate = moment(currentISODate).format(
      "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
    );

    const today = moment().format("YYYY-MM-DD");
    const userDetails = req.body.userData;
    const doctorDetails = req.body.doctorDetails;
    const user = await User.findById(userDetails.id);

    const newSession = await Session.create({
      userId: user.id,
      userName: userDetails.name,
      doctorId: doctorDetails._id,
      doctorName: doctorDetails.fullName,
      timeSlot: req.body.time,
      plan: req.body.plan,
      sessionDate: req.body.date,
      bookedDate: today,
      startTime: isoDate,
      endTime: twoHoursLater,
      link: null,
    });

    res
      .status(200)
      .json({ message: "Session booked successfully", newSession });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const appointment = async (req, res) => {
  try {
    const doctorId = req.body.doctorDetails._id;
    const date = req.body.date;
    const time = req.body.time;

    await Doctor.findByIdAndUpdate(
      doctorId,
      {
        $push: {
          appointments: {
            date: date,
            times: [time],
          },
        },
      },
      { new: true }
    );
    res.status(200).json({ message: "appointment scheduled successfully" });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const availability = async (req, res) => {
  try {
    const doctorId = req.body.doctorId;
    const date = req.body.date;
    const time = req.body.time;
    const userId = req.body.userId;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return false;
    }

    const session = await Session.findOne({
      userId: userId,
      sessionDate: date,
      timeSlot: time,
    });

    const appointment = doctor.appointments.find((appointment) => {
      return (
        appointment.date.toISOString().substr(0, 10) === date &&
        appointment.times.includes(time)
      );
    });

    if (session) {
      return res
        .status(204)
        .json({ message: `Appointment already exists for ${date} at ${time}` });
    }

    if (appointment) {
      return res
        .status(202)
        .json({ message: `Appointment already exists for ${date} at ${time}` });
    }

    return res
      .status(200)
      .json({ message: `Time ${time} is available for ${doctor.fullName}` });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const session = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const size = req.query.limit ? parseInt(req.query.limit) : 8;
    const skip = (page - 1) * size;
    const total = await Session.countDocuments();
    const id = req.params.id;
    const session = await Session.find({ userId: id })
      .sort({ bookedDate: -1 })
      .skip(skip)
      .limit(size);
    res.json({ session, total, page, size });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const activeSession = async (req, res) => {
  // const currentISODate = new Date();
  // //  currentISODate.setHours(currentISODate.getHours())+1;
  // currentISODate.setHours(currentISODate.getHours()-2);

  const currentISODate = new Date();
  currentISODate.setHours(currentISODate.getHours() + 5);
  currentISODate.setMinutes(currentISODate.getMinutes() + 30);

  try {
    const session = await Session.findOne({
      userId: req.params.id,
      startTime: { $lte: currentISODate },
      endTime: { $gte: currentISODate },
    });
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const getTime = async (req, res) => {
  try {
    const doctorId = req.query.value1;
    const Inputdate = req.query.value2;
    const findTime = await Appointment.findOne({
      doctor: doctorId,
      "timeAndDate.date": Inputdate,
    });
    const date = new Date(Inputdate);
    date.setUTCHours(0, 0, 0, 0); // set hours, minutes, seconds, and milliseconds to zero
    const isoString = date.toISOString().slice(0, 23) + 'Z'; // format as ISO string
    

    const doctor = await Doctor.findById(doctorId);
    const matchingAppointments = doctor.appointments.filter(appointment => {
    const appointmentDateOnly = new Date(appointment.date).setUTCHours(0, 0, 0, 0);
    const inputDateOnly = new Date(Inputdate).setUTCHours(0, 0, 0, 0);
    return appointmentDateOnly === inputDateOnly;
  });
  const timings = matchingAppointments.flatMap(appointment => appointment.times);

    let appTimings = findTime?.timeAndDate?.timings;
    if (appTimings === undefined) {
      appTimings = [];
    }

    const commonTimings = appTimings.filter((time) => {
      return !timings.includes(time);
    });
    res.status(200).json(commonTimings);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const cancelSession = async (req, res) => {
  try {
    const { sessionID } = req.body;
    await Session.findOneAndRemove({ _id: sessionID });
    res.status(200).json("appointment deleted successfully");
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { doctorID, appDate, appTime } = req.body;
    const dateStr = appDate;
    const date = new Date(dateStr);
    const isoStr = date.toISOString();

    await Doctor.updateOne(
      { _id: doctorID },
      {
        $pull: {
          appointments: {
            date: isoStr,
            times: appTime,
          },
        },
      }
    );
    return res
      .status(200)
      .json({ message: "appointment deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};
