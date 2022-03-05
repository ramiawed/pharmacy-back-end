const express = require("express");
const authController = require("../controller/authController");
const advertisementController = require("../controller/advertisementController");
const Advertisement = require("../models/advertisementModel.js");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/advertisements");
  },
  filename: function (req, file, cb) {
    const name = Date.now() + file.originalname;
    cb(null, name);
    req.name = name;
  },
});
const upload = multer({ storage: storage });

const advertisementRouter = express.Router();

advertisementRouter
  .route("/")
  .get(authController.protect, advertisementController.getAllAdvertisements);

advertisementRouter.post(
  "/upload",
  upload.single("file"),
  authController.protect,
  authController.restrictTo("admin"),
  async (req, res) => {
    const name = req.name;
    const { company, warehouse, medicine } = req.body;

    let newAdvertisement = {
      logo_url: name,
    };

    if (company !== "null") {
      newAdvertisement = {
        ...newAdvertisement,
        company: `${company}`,
      };
    }

    if (warehouse !== "null") {
      newAdvertisement = {
        ...newAdvertisement,
        warehouse: `${warehouse}`,
      };
    }

    if (medicine !== "null") {
      newAdvertisement = {
        ...newAdvertisement,
        medicine: `${medicine}`,
      };
    }

    let advertisement;
    try {
      advertisement = await Advertisement.create(newAdvertisement);
      advertisement = await advertisement
        .populate({
          path: "company",
          model: "User",
          select: "_id name type allowShowingMedicines city",
        })
        .populate({
          path: "warehouse",
          model: "User",
          select: "_id name type allowShowingMedicines city",
        })
        .populate({
          path: "medicine",
          model: "Item",
          select: "_id name",
        })
        .execPopulate();
    } catch (err) {}

    res.status(200).json({
      status: "success",
      data: {
        advertisement,
      },
    });
  }
);

advertisementRouter.post(
  "/:id",
  authController.protect,
  authController.restrictTo("admin"),
  advertisementController.deleteAdvertisement
);

module.exports = advertisementRouter;
