import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
    {
        conversationId: {
          type: String,
        },
        sender: {
          type: String,
        },
        text: {
          type: String,
        },
      },
      { timestamps: true }
);

const Message = mongoose.model("Messsage", messageSchema);
export default Message;
