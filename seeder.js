const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Member = require("./model/Member");
const members = require("./data/MOCK_DATA.json");

//load the .env file
dotenv.config();

//connect to our mongodb atlas database
mongoose.connect(process.env.MONGO_DB_URL);

const importData = async () => {
  try {
    await Member.deleteMany();
    await Member.insertMany(members);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const clearData = async () => {
  try {
    await Member.deleteMany();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  clearData();
} else {
  importData();
}
