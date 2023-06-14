import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  timings: {
    type: [String],
    required: true,
  },
});

const AppointmentSchema = mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  timeAndDate: {
    type: appointmentSchema,
  },
});

const Appointment = mongoose.model("Appointment", AppointmentSchema);
export default Appointment;
