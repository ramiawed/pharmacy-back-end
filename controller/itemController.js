const Item = require("../models/itemModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const itemAllowedFields = [
  "name",
  "company",
  "caliber",
  "formula",
  "indication",
  "composition",
  "packing",
  "price",
  "customer_price",
  "barcode",
  "logo_url",
  "isActive",
  "warehouses",
  "inSectionOne",
  "inSectionTwo",
  "inSectionThree",
];

// remove unwanted property from an object
const filterObj = (obj) => {
  let newObj = {};
  Object.keys(obj).forEach((key) => {
    if (itemAllowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

exports.getItems = catchAsync(async (req, res, next) => {
  const {
    page,
    limit,
    companyId,
    warehouseId,
    itemName,
    companyName,
    warehouseName,
    isActive,
    inWarehouse,
    outWarehouse,
    sort,
    inSectionOne,
    inSectionTwo,
    inSectionThree,
    city,
    barcode,
    forAdmin,
  } = req.query;

  const user = req.user;

  let count;
  let items;

  // array that contains all the conditions
  const conditionArray = [];

  // get items from admin perspective (warehouse, company, admin)
  if (forAdmin === "true") {
    // get the items for a specific company
    if (companyId) {
      conditionArray.push({ company: companyId });
    }

    // get the items for a specific warehouse
    if (warehouseId) {
      conditionArray.push({ "warehouses.warehouse": warehouseId });
    }

    // get items by item name
    if (itemName) {
      conditionArray.push({
        $or: [
          { name: { $regex: itemName, $options: "i" } },
          { composition: { $regex: itemName, $options: "i" } },
          { barcode: itemName },
        ],
      });
    }

    // search by company name
    if (companyName) {
      // get the ids for all company that there name match the companyName
      const companiesArray = await User.find({
        name: { $regex: companyName, $options: "i" },
        type: "company",
      });

      // map each company object to it's id
      const arr = companiesArray.map((company) => company._id);

      // get all items that company id in the companies ids array
      conditionArray.push({
        company: { $in: arr },
      });
    }

    // search by warehouse name
    if (warehouseName) {
      // get the ids for all warehouse that there name match the warehouseName
      const warehouseArray = await User.find({
        name: { $regex: warehouseName, $options: "i" },
        type: "warehouse",
      });

      // map each warehouse object to it's id
      const arr = warehouseArray.map((warehouse) => warehouse._id);

      // get all items that warehouse id in the warehouse ids array
      conditionArray.push({
        "warehouses.warehouse": { $in: arr },
      });
    }

    // active condition
    if (isActive !== undefined) {
      conditionArray.push({ isActive: isActive });
    }

    if (inWarehouse) {
      conditionArray.push({ warehouses: { $ne: [] } });
    }
    if (outWarehouse) {
      conditionArray.push({ warehouses: [] });
    }
  } else {
    // get the active and approved company
    let activeApprovedCompany = await User.find({
      type: "company",
      isApproved: true,
      isActive: true,
    });

    activeApprovedCompany = activeApprovedCompany.map((c) => c._id);
    conditionArray.push({
      company: { $in: activeApprovedCompany },
    });

    if (companyId) {
      conditionArray.push({ company: companyId });
    }

    // get the items for a specific warehouse
    if (warehouseId) {
      conditionArray.push({ "warehouses.warehouse": warehouseId });
    }

    // search by item name
    if (itemName) {
      conditionArray.push({
        $or: [
          { name: { $regex: itemName, $options: "i" } },
          { composition: { $regex: itemName, $options: "i" } },
          { barcode: itemName },
        ],
      });
    }

    // search byt company name
    if (companyName) {
      // get the ids for all company that there name match the companyName
      const companiesArray = await User.find({
        name: { $regex: companyName, $options: "i" },
        type: "company",
      });

      // map each company object to it's id
      const arr = companiesArray.map((company) => company._id);

      // get all items that company id in the companies ids array
      conditionArray.push({
        company: { $in: arr },
      });
    }

    // get items for a specific warehouse
    if (warehouseName) {
      // get the ids for all warehouse that there name match the warehouseName
      const specificCity = user.type === "pharmacy" ? user.city : "";
      const warehouseArray = await User.find({
        name: { $regex: warehouseName, $options: "i" },
        type: "warehouse",
        city: { $regex: specificCity, $options: "i" },
        isApproved: true,
        isActive: true,
      });

      // map each warehouse object to it's id
      const arr = warehouseArray.map((warehouse) => warehouse._id);

      // get all items that warehouse id in the warehouse ids array
      conditionArray.push({
        "warehouses.warehouse": { $in: arr },
      });
    }

    if (inSectionOne !== undefined) {
      conditionArray.push({ inSectionOne: inSectionOne });
    }

    if (inSectionTwo !== undefined) {
      conditionArray.push({ inSectionTwo: inSectionTwo });
    }

    if (inSectionThree !== undefined) {
      conditionArray.push({ inSectionThree: inSectionThree });
    }

    // active condition
    if (isActive !== undefined) {
      conditionArray.push({ isActive: isActive });
    }

    if (inWarehouse) {
      if (user.type === "pharmacy") {
        let filteredWarehouseArray = await User.find({
          type: "warehouse",
          city: user.city,
          isApproved: true,
          isActive: true,
        });

        filteredWarehouseArray.map((w) => w._id);

        conditionArray.push({
          "warehouses.warehouse": { $in: filteredWarehouseArray },
        });
      }

      if (user.type === "warehouse") {
        conditionArray.push({
          "warehouses.warehouse": user._id,
        });
      }

      if (user.type === "admin") {
        let filteredWarehouseArray = await User.find({
          type: "warehouse",
          isApproved: true,
          isActive: true,
        });

        filteredWarehouseArray.map((w) => w._id);

        conditionArray.push({
          "warehouses.warehouse": { $in: filteredWarehouseArray },
        });
      }
    }
    if (outWarehouse) {
      if (user.type === "pharmacy") {
        let filteredWarehouseArray = await User.find({
          type: "warehouse",
          city: user.city,
          isApproved: true,
          isActive: true,
        });

        filteredWarehouseArray.map((w) => w._id);

        conditionArray.push({
          "warehouses.warehouse": { $nin: filteredWarehouseArray },
        });
      }

      if (user.type === "warehouse") {
        conditionArray.push({
          "warehouses.warehouse": { $ne: user._id },
        });
      }

      if (user.type === "admin") {
        let filteredWarehouseArray = await User.find({
          type: "warehouse",
          isApproved: true,
          isActive: true,
        });

        filteredWarehouseArray.map((w) => w._id);

        conditionArray.push({
          "warehouses.warehouse": { $nin: filteredWarehouseArray },
        });
      }
    }
  }

  count = await Item.countDocuments(
    conditionArray.length > 0 ? { $and: conditionArray } : {}
  );

  items = await Item.find(
    conditionArray.length > 0 ? { $and: conditionArray } : {}
  )
    .sort(sort ? sort + " _id" : "createdAt _id")
    .select(
      "_id name caliber formula company warehouses price customer_price logo_url packing isActive existing_place composition barcode"
    )
    .populate({
      path: "company",
      model: "User",
      select: "_id name allowAdmin",
    })
    .populate({
      path: "warehouses.warehouse",
      model: "User",
      select: "_id name city isActive isApproved",
    })
    .skip((page - 1) * (limit * 1))
    .limit(limit * 1);

  res.status(200).json({
    status: "success",
    count,
    data: {
      items,
    },
  });
});

exports.getAllItems = catchAsync(async (req, res, next) => {
  const items = await Item.find({});

  res.status(200).json({
    status: "success",
    data: {
      data: items,
    },
  });
});

exports.getItemById = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;

  if (!itemId) {
    return next(new AppError("please provide item id"));
  }

  const item = await Item.findById(itemId)
    .select(
      "_id name caliber formula company warehouses price customer_price logo_url packing isActive existing_place composition indication barcode"
    )
    .populate({
      path: "company",
      model: "User",
      select: "_id name allowAdmin",
    })
    .populate({
      path: "warehouses.warehouse",
      model: "User",
      select: "_id name city isActive isApproved",
    });

  if (!item) {
    return next(new AppError("no such item"));
  }

  res.status(200).json({
    status: "success",
    data: {
      item,
    },
  });
});

exports.getAllItemsForCompany = catchAsync(async (req, res, next) => {
  const items = await Item.find({ company: req.params.companyId }).select(
    "_id name caliber formula indication composition packing price customer_price barcode"
  );

  res.status(200).json({
    status: "success",
    data: {
      items,
    },
  });
});

// add a new item
exports.addItem = catchAsync(async (req, res, next) => {
  // filter the request body
  const filteredItem = filterObj(req.body);

  // create a new item
  const newItem = await Item.create(filteredItem);

  // check if something goes wrong
  if (!newItem) {
    return next(new AppError("Something went wrong"));
  }

  // response with the newly item
  res.status(200).json({
    status: "success",
    data: {
      item: newItem,
    },
  });
});

exports.addAndUpdateItems = catchAsync(async (req, res, next) => {
  const { withUpdate } = req.query;
  const items = req.body;

  if (withUpdate === "addUpdate") {
    for (let i = 0; i < items.length; i++) {
      await Item.findByIdAndUpdate(items[i]._id, {
        price: items[i].price,
        customer_price: items[i].customer_price,
        indication: items[i].indication,
        composition: items[i].composition,
        barcode: items[i].barcode,
      });
    }
  } else {
    await Item.insertMany(items, { lean: false });
  }

  // response with the newly item
  res.status(200).json({
    status: "success",
  });
});

// update an item
exports.updateItem = catchAsync(async (req, res, next) => {
  // get itemId from the request parameters
  const { itemId } = req.params;

  // filter the request body
  const filteredItem = filterObj(req.body);

  // update the item and return the new one
  const updatedItem = await Item.findByIdAndUpdate(itemId, filteredItem, {
    new: true,
    runValidators: true,
  })
    .populate({
      path: "warehouses.warehouse",
      model: "User",
    })
    .populate({
      path: "company",
      model: "User",
    });

  // response with the updated item
  res.status(200).json({
    status: "success",
    data: {
      item: updatedItem,
    },
  });
});

// change the active state in the item based on the query string
// id the query string if the action property equals to delete
// set the isActive to false otherwise set it to true
exports.changeItemActiveState = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  const { action } = req.body;

  let item;

  if (action === "delete")
    item = await Item.findByIdAndUpdate(
      itemId,
      { isActive: false },
      { new: true }
    )
      .populate({
        path: "warehouses.warehouse",
        model: "User",
      })
      .populate({
        path: "company",
        model: "User",
      });
  else
    item = await Item.findByIdAndUpdate(
      itemId,
      { isActive: true },
      { new: true }
    )
      .populate({
        path: "warehouses.warehouse",
        model: "User",
      })
      .populate({
        path: "company",
        model: "User",
      });

  res.status(200).json({
    status: "success",
    data: {
      item,
    },
  });
});

// add item to the warehouse
exports.addItemToWarehouse = catchAsync(async (req, res, next) => {
  // get the item id from request parameters

  const { itemId, city } = req.params;

  // get the warehouseId and caliber from request body
  const { warehouseId } = req.body;

  // check if the warehouse and caliber fields exist in the request body
  if (!warehouseId) {
    return next(new AppError(`Please provide the required fields`));
  }

  // find the item specified by itemId
  const findItem = await Item.findById(itemId);

  // if the item doesn't exist
  if (!findItem) {
    return next(new AppError(`No item found`, 400));
  }

  findItem.warehouses = [
    ...findItem.warehouses,
    { warehouse: warehouseId, maxQty: 0 },
  ];

  // findItem.existing_place = {
  //   ...findItem.existing_place,
  //   [city]: findItem.existing_place[city] + 1,
  // };

  await findItem.save();

  const item = await Item.findById(itemId)
    .populate({
      path: "warehouses.warehouse",
      model: "User",
      select: "_id name city",
    })
    .populate({
      path: "company",
      model: "User",
      select: "_id name",
    });

  res.status(200).json({
    status: "success",
    data: {
      item: item,
    },
  });
});

exports.changeItemWarehouseMaxQty = catchAsync(async (req, res, next) => {
  // get the item id from request parameters
  const { itemId } = req.params;

  // get the warehouseId and caliber from request body
  const { warehouseId, qty } = req.body;

  // check if the warehouse and caliber fields exist in the request body
  if (!warehouseId) {
    return next(new AppError(`Please provide the required fields`));
  }

  // find the item specified by itemId
  const findItem = await Item.findById(itemId);

  // if the item doesn't exist
  if (!findItem) {
    return next(new AppError(`No item found`, 400));
  }

  findItem.warehouses = findItem.warehouses.map((w) => {
    if (w.warehouse == warehouseId) {
      return { warehouse: warehouseId, offer: w.offer, maxQty: qty };
    } else return w;
  });

  await findItem.save();

  res.status(200).json({
    status: "success",
    data: {
      item: findItem,
    },
  });
});

exports.changeOffer = catchAsync(async (req, res, next) => {
  // get the item id from request parameters
  const { itemId } = req.params;

  // get the warehouseId and caliber from request body
  const { warehouseId, offer } = req.body;

  // check if the warehouseId exist in the body request
  if (!warehouseId) {
    return next(new AppError(`Please provide the required fields`));
  }

  // find the item specified by itemId
  const findItem = await Item.findById(itemId);

  // if the item doesn't exist
  if (!findItem) {
    return next(new AppError(`No item found`, 400));
  }

  findItem.warehouses = findItem.warehouses.map((w) => {
    if (w.warehouse == warehouseId) {
      return { warehouse: warehouseId, offer: offer, maxQty: w.maxQty };
    } else return w;
  });

  await findItem.save();

  const returnedItem = await Item.findById(itemId)
    .populate({
      path: "warehouses.warehouse",
      model: "User",
    })
    .populate({
      path: "company",
      model: "User",
      select: "_id name",
    });

  res.status(200).json({
    status: "success",
    data: {
      item: returnedItem,
    },
  });
});

//remove item from the warehouse
exports.removeItemFromWarehouse = catchAsync(async (req, res, next) => {
  // get the item id from request parameters
  const { itemId, city } = req.params;

  // get the warehouseId and caliber from request body
  const { warehouseId } = req.body;

  // check if the warehouse and caliber fields exist in the request body
  if (!warehouseId) {
    return next(new AppError(`Please provide the required fields`));
  }

  // find the item specified by itemId
  const findItem = await Item.findById(itemId)
    .populate({
      path: "warehouses.warehouse",
      model: "User",
      select: "_id name city",
    })
    .populate({
      path: "company",
      model: "User",
      select: "_id name",
    });

  // if the item doesn't exist
  if (!findItem) {
    return next(new AppError(`No item found`, 400));
  }

  findItem.warehouses = findItem.warehouses.filter((w) => {
    return !w.warehouse.equals(warehouseId);
  });

  // findItem.existing_place = {
  //   ...findItem.existing_place,
  //   [city]: findItem.existing_place[city] - 1,
  // };

  await findItem.save();

  res.status(200).json({
    status: "success",
    data: {
      item: findItem,
    },
  });
});

exports.uploadImage = catchAsync(async (req, res, next) => {
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
  } catch (err) {}

  await Item.findByIdAndUpdate(itemId, {
    logo_url: name,
  });

  res.status(200).json({
    status: "success",
    data: {
      name: name,
    },
  });
});

exports.changeIsFavoriteField = catchAsync(async (req, res, next) => {
  const { option, id } = req.body;

  const item = await Item.findByIdAndUpdate(
    id,
    { inSectionOne: option },
    { new: true }
  )
    .populate({
      path: "warehouses.warehouse",
      model: "User",
    })
    .populate({
      path: "company",
      model: "User",
    });

  res.status(200).json({
    status: "success",
    data: {
      item,
    },
  });
});

exports.restoreData = catchAsync(async (req, res, next) => {
  const body = req.body;

  await Item.deleteMany({});

  await Item.insertMany(body);

  res.status(200).json({
    status: "success",
  });
});
