//#region Database Connection

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("💯🚀 MongoDB Atlas Connected Successfully | Database is Live");
    } catch (err) {
        console.error("❌ MongoDB Atlas Connection Failed!", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
//#endregion