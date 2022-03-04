const socket = (io) => {
  const User = require("./models/userModel");
  const Order = require("./models/orderModel");
  const Notification = require("./models/notificationModel");
  const Setting = require("./models/settingModel");
  const Item = require("./models/itemModel");
  const Advertisement = require("./models/advertisementModel");

  const userStream = User.watch();
  const orderStream = Order.watch();
  const notificationStream = Notification.watch();
  const settingStream = Setting.watch();
  const itemStream = Item.watch();
  const advertisementStream = Advertisement.watch();

  userStream.on("change", async (change) => {
    if (change.operationType === "update") {
      if (
        (Object.keys(change.updateDescription.updatedFields).includes(
          "isApproved"
        ) &&
          change.updateDescription.updatedFields.isApproved === false) ||
        (Object.keys(change.updateDescription.updatedFields).includes(
          "isActive"
        ) &&
          change.updateDescription.updatedFields.isActive === false)
      ) {
        io.emit("user-sign-out", change.documentKey._id);
      }

      // add user to companies section one or warehouses section one
      if (
        Object.keys(change.updateDescription.updatedFields).includes(
          "inSectionOne"
        ) &&
        change.updateDescription.updatedFields.inSectionOne === true
      ) {
        const user = await User.findById(change.documentKey._id).select(
          "_id type logo_url allowShowingMedicines name city"
        );
        if (user.type === "company") {
          io.emit("user-added-to-section-one", user);
        } else {
          io.emit("warehouse-added-to-section-one", user);
        }
      }

      // remove user from companies section one or warehouses section one
      if (
        Object.keys(change.updateDescription.updatedFields).includes(
          "inSectionOne"
        ) &&
        change.updateDescription.updatedFields.inSectionOne === false
      ) {
        const user = await User.findById(change.documentKey._id).select(
          "_id type logo_url allowShowingMedicines name city"
        );
        if (user.type === "company") {
          io.emit("user-removed-from-section-one", user._id);
        } else {
          io.emit("warehouse-removed-from-section-one", user._id);
        }
      }

      // add user to companies section two
      if (
        Object.keys(change.updateDescription.updatedFields).includes(
          "inSectionTwo"
        ) &&
        change.updateDescription.updatedFields.inSectionTwo === true
      ) {
        const user = await User.findById(change.documentKey._id).select(
          "_id type logo_url allowShowingMedicines name city"
        );
        io.emit("user-added-to-section-two", user);
      }

      // remove user to companies section two
      if (
        Object.keys(change.updateDescription.updatedFields).includes(
          "inSectionTwo"
        ) &&
        change.updateDescription.updatedFields.inSectionTwo === false
      ) {
        const user = await User.findById(change.documentKey._id).select(
          "_id type logo_url allowShowingMedicines name city"
        );
        io.emit("user-removed-from-section-two", user._id);
      }
    }

    if (change.operationType === "insert") {
      io.emit("user-added", change.fullDocument);
    }

    // io.emit("user-changed", change);
  });

  orderStream.on("change", (change) => {
    io.emit("order-changed", change);
  });

  notificationStream.on("change", (change) => {
    io.emit("notification-changed", change);
  });

  settingStream.on("change", (change) => {
    io.emit("settings-changed", change);
  });

  itemStream.on("change", async (change) => {
    if (change.operationType === "update") {
      // item added to section one
      if (
        Object.keys(change.updateDescription.updatedFields).includes(
          "inSectionOne"
        ) &&
        change.updateDescription.updatedFields.inSectionOne === true
      ) {
        const item = await Item.findById(change.documentKey._id);
        io.emit("item-added-to-section-one", item);
      }

      // item remove from section one
      if (
        Object.keys(change.updateDescription.updatedFields).includes(
          "inSectionOne"
        ) &&
        change.updateDescription.updatedFields.inSectionOne === false
      ) {
        const item = await Item.findById(change.documentKey._id).select("_id");
        io.emit("item-removed-from-section-one", item._id);
      }

      // item added to section two
      if (
        Object.keys(change.updateDescription.updatedFields).includes(
          "inSectionTwo"
        ) &&
        change.updateDescription.updatedFields.inSectionTwo === true
      ) {
        const item = await Item.findById(change.documentKey._id);
        io.emit("item-added-to-section-two", item);
      }

      // item remove from section two
      if (
        Object.keys(change.updateDescription.updatedFields).includes(
          "inSectionTwo"
        ) &&
        change.updateDescription.updatedFields.inSectionTwo === false
      ) {
        const item = await Item.findById(change.documentKey._id).select("_id");
        io.emit("item-removed-from-section-two", item._id);
      }

      // item added to section three
      if (
        Object.keys(change.updateDescription.updatedFields).includes(
          "inSectionThree"
        ) &&
        change.updateDescription.updatedFields.inSectionThree === true
      ) {
        const item = await Item.findById(change.documentKey._id);
        io.emit("item-added-to-section-three", item);
      }

      // item remove from section three
      if (
        Object.keys(change.updateDescription.updatedFields).includes(
          "inSectionThree"
        ) &&
        change.updateDescription.updatedFields.inSectionThree === false
      ) {
        const item = await Item.findById(change.documentKey._id).select("_id");
        io.emit("item-removed-from-section-three", item._id);
      }

      // warehouse add a bonus to item
      if (
        Object.keys(change.updateDescription.updatedFields).includes(
          "warehouses"
        )
      ) {
        const warehouses = [];
        for (
          let i = 0;
          i < change.updateDescription.updatedFields["warehouses"].length;
          i++
        ) {
          const warehouse = await User.findById(
            change.updateDescription.updatedFields["warehouses"][i].warehouse
          ).select("_id name city");
          warehouses.push({
            ...change.updateDescription.updatedFields["warehouses"][i],
            warehouse,
          });
        }
        if (
          Object.keys(change.updateDescription.updatedFields).includes(
            "existing_place"
          )
        ) {
          io.emit("warehouse-add-or-delete-item", {
            itemId: change.documentKey._id,
            warehouses,
            existing_place:
              change.updateDescription.updatedFields["existing_place"],
          });
        } else {
          io.emit("warehouse-add-bonus", {
            itemId: change.documentKey._id,
            warehouses,
          });
        }
      }
    }
  });

  advertisementStream.on("change", (change) => {
    if (change.operationType === "insert") {
      io.emit("new-advertisement", change.fullDocument);
    }
  });
};

module.exports = socket;
