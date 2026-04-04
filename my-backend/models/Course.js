//#region Course Model
// Ye model humare courses ke liye hai. Isme hum course ka title, description, price, thumbnail, instructor, aur videos store karenge. 
// Jab bhi koi course create hoga, toh iska record yahan save ho jayega, taki hum future me usko access kar sakein.
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    thumbnail: { type: String },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    videos: [
      {
        title: { type: String, required: true },
        videoUrl: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
//#endregion