const express = require("express");
const itemController = require("../controller/itemController");
const authController = require("../controller/authController");

const multer = require("multer");
const Item = require("../models/itemModel");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/items");
  },
  filename: function (req, file, cb) {
    const name = Date.now() + file.originalname;
    cb(null, name);
    req.name = name;
  },
});
const upload = multer({ storage: storage });

const itemRoutes = express.Router();

itemRoutes
  .route("/")
  .get(authController.protect, itemController.getItems)
  .post(
    authController.protect,
    authController.restrictTo("company", "admin"),
    itemController.addItem
  );

itemRoutes.get(
  "/allItem/:companyId",
  authController.protect,
  itemController.getAllItemsForCompany
);

itemRoutes
  .route("/excel")
  .post(
    authController.protect,
    authController.restrictTo("company", "admin"),
    itemController.addAndUpdateItems
  );

itemRoutes
  .route("/item/:itemId")
  .get(authController.protect, itemController.getItemById)
  .post(
    authController.protect,
    authController.restrictTo("company", "admin"),
    itemController.updateItem
  );

itemRoutes
  .route("/active/:itemId")
  .post(
    authController.protect,
    authController.restrictTo("company", "admin"),
    itemController.changeItemActiveState
  );

itemRoutes
  .route("/warehouse/add-item/:itemId/:city")
  .post(
    authController.protect,
    authController.restrictTo("warehouse"),
    itemController.addItemToWarehouse
  );

itemRoutes
  .route("/warehouse/remove-item/:itemId/:city")
  .post(
    authController.protect,
    authController.restrictTo("warehouse", "admin"),
    itemController.removeItemFromWarehouse
  );

itemRoutes
  .route("/warehouse/change-max-qty/:itemId")
  .post(
    authController.protect,
    authController.restrictTo("warehouse", "admin"),
    itemController.changeItemWarehouseMaxQty
  );

itemRoutes
  .route("/warehouse/change-offer/:itemId")
  .post(
    authController.protect,
    authController.restrictTo("warehouse", "admin"),
    itemController.changeOffer
  );

userRouter.post(
  "/upload/:itemId",
  upload.single("file"),
  authController.protect,
  async (req, res) => {
    const name = req.name;
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId);

    try {
      // if the user have a logo, delete it
      if (item.logo_url && item.logo_url !== "") {
        if (fs.existsSync(`${__basedir}/public/items/${item.logo_url}`)) {
          fs.unlinkSync(`${__basedir}/public/items/${item.logo_url}`);
        }
      }
    } catch (err) {
      console.log(err);
    }

    await Item.findByIdAndUpdate(itemId, {
      logo_url: name,
    });

    res.status(200).json({
      status: "success",
      data: {
        name: name,
      },
    });
  }
);
module.exports = itemRoutes;
