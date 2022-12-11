const router = require("express").Router();
const Member = require("../model/Member");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

// Upload profile image directory
const IMAGE_DIR = "./images/";

// set multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGE_DIR);
  },
  filename: (req, file, cb) => {
    //generate random uuid
    const fileName = uuidv4() + path.extname(file.originalname);
    cb(null, fileName);
  },
});

// Limit file upload only to images
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format is allowed!"));
    }
  },
});

// Create Member
router.post("/", upload.single("file"), async (req, res) => {
  const newMember = new Member(req.body);
  try {
    // save the generated filename in our MongoDB Atlas database
    if (typeof req.file === "undefined") {
      newMember.imagePic = "./images/defaultPic.png";
    } else {
      newMember.imagePic = req.file.path;
    }
    const savedMember = await newMember.save();
    res.status(200).json(savedMember);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Get Member list or Search Member by rfid or memberid query parameters
router.get("/", async (req, res) => {
  const memberId = req.query.memberId;
  const rfId = req.query.rfId;

  // if either studenId or rfId query parameters is present
  if (memberId || rfId) {
    try {
      let member;
      if (memberId && rfId) {
        member = await Member.find({
          memberId: memberId,
          rfidBadgeNumber: rfId,
        });
      } else if (memberId) {
        member = await Member.find({ memberId });
      } else if (rfId) {
        member = await Member.find({ rfidBadgeNumber: rfId });
      }
      return res.status(200).json(member);
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }
  // else return the whole Member list
  try {
    const memberList = await Member.find();
    res.status(200).json(memberList);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Get Member by ID
router.get("/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Update Member
router.put("/:id", upload.single("file"), async (req, res, next) => {
  //If a new profile pic is uploaded then process it first by deleting the old image file from disk
  if (req.file) {
    try {
      //find by id
      const oldMemberDetails = await Member.findById(req.params.id);
      if (!oldMemberDetails) {
        throw new Error("Member not found!");
      }

      //if old image file exist then the delete file from directory
      if (fs.existsSync(oldMemberDetails.imagePic)) {
        fs.unlink(oldMemberDetails.imagePic, (err) => {
          if (err) {
            throw new Error("Failed to delete file..");
          } else {
            console.log("file deleted");
          }
        });
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
  // Update the database with new details
  try {
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
        imagePic: req.file?.path,
      },
      { new: true }
    );
    res.status(200).json(updatedMember);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Delete Member
router.delete("/:id", async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.status(200).json("Member has been deleted...");
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
