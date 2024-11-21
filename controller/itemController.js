const Item = require("../models/itemModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

const itemAllowedFields = [
  "name",
  "nameAr",
  "company",
  "caliber",
  "formula",
  "indication",
  "composition",
  "packing",
  "price",
  "customer_price",
  "barcode",
  "barcodeTwo",
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

exports.getItemsNewVersion = catchAsync(async (req, res, next) => {
  const {
    page,
    limit,
    companyId,
    warehouseId,
    itemName,
    haveOffer,
    havePoint,
    sort,
    searchCompaniesIds,
    searchWarehousesIds,
    searchInWarehouses,
    searchOutWarehouses,
    searchWarehouseCompanyId,
    isActive,
    inSectionOne,
    inSectionTwo,
    inSectionThree,
  } = req.query;

  let userW = [];
  const { type, city, _id } = req.user;

  if (type === "admin") {
    userW = await User.find({
      type: "warehouse",
      isActive: true,
    }).select("_id");
    userW = userW.map((w) => w._id);
  }

  if (type === "pharmacy") {
    userW = await User.find({
      type: "warehouse",
      isActive: true,
      city: city,
    }).select("_id");
    userW = userW.map((w) => w._id);
  }

  if (type === "warehouse") {
    userW = [_id];
  }

  // array that contains all the conditions
  const conditionArray = [];

  if (inSectionOne) {
    conditionArray.push({ inSectionOne: true });
  }

  if (inSectionTwo) {
    conditionArray.push({ inSectionTwo: true });
  }

  if (inSectionThree) {
    conditionArray.push({ inSectionThree: true });
  }

  if (isActive !== undefined) {
    conditionArray.push({ isActive: isActive });
  }

  if (searchCompaniesIds) {
    conditionArray.push({ company: { $in: searchCompaniesIds } });
  }

  if (searchWarehousesIds) {
    conditionArray.push({
      "warehouses.warehouse": { $in: searchWarehousesIds },
    });
  }

  if (companyId) {
    conditionArray.push({ company: companyId });
  }

  if (searchWarehouseCompanyId) {
    conditionArray.push({ company: searchWarehouseCompanyId });
  }

  // get the items for a specific warehouse
  if (warehouseId) {
    conditionArray.push({ "warehouses.warehouse": warehouseId });
  }

  if (searchInWarehouses) {
    conditionArray.push({
      "warehouses.warehouse": { $in: userW },
    });
  }

  if (searchOutWarehouses) {
    conditionArray.push({
      "warehouses.warehouse": { $nin: userW },
    });
  }

  if (haveOffer) {
    conditionArray.push({
      warehouses: {
        $elemMatch: {
          warehouse: { $in: userW },
          "offer.mode": { $in: ["pieces", "percentage"] },
        },
      },
    });
  }

  if (havePoint) {
    conditionArray.push({
      warehouses: {
        $elemMatch: {
          warehouse: { $in: userW },
          points: { $elemMatch: { $exists: true } },
        },
      },
    });
  }

  // search by item name
  if (itemName) {
    conditionArray.push({
      $or: [
        { name: { $regex: `${itemName}`, $options: "i" } },
        { nameAr: { $regex: `${itemName}`, $options: "i" } },
        { composition: { $regex: `${itemName}`, $options: "i" } },
        { barcode: `${itemName}` },
        { barcodeTwo: `${itemName}` },
      ],
    });
  }

  const count = await Item.countDocuments(
    conditionArray.length > 0 ? { $and: conditionArray } : {}
  );

  if (itemName) {
    const items = await Item.find(
      conditionArray.length > 0 ? { $and: conditionArray } : {}
    )
      .sort(sort ? sort + " _id" : "nameAr _id")
      .select(
        "_id name caliber formula company warehouses price customer_price logo_url packing isActive  composition barcode barcodeTwo nameAr"
      )
      .populate({
        path: "company",
        model: "User",
        select: "_id name allowAdmin logo_url",
      })
      .populate({
        path: "warehouses.warehouse",
        model: "User",
        select:
          "_id name city isActive  costOfDeliver invoiceMinTotal fastDeliver payAtDeliver includeInPointSystem pointForAmount amountToGetPoint",
      });

    let searchNameResults = [];
    let searchNameArResults = [];
    let searchCompositionResults = [];

    items.forEach((item) => {
      if (item.name.toLowerCase().includes(itemName.toLowerCase())) {
        searchNameResults.push(item);
      } else if (item.nameAr.toLowerCase().includes(itemName.toLowerCase())) {
        searchNameArResults.push(item);
      } else {
        searchCompositionResults.push(item);
      }
    });
    const startIndex = (page - 1) * (limit * 1);
    const endIndex = startIndex + limit * 1;

    const itemsResult = [
      ...searchNameResults,
      ...searchNameArResults,
      ...searchCompositionResults,
    ].slice(startIndex, endIndex);

    res.status(200).json({
      status: "success",
      count,
      data: {
        items: itemsResult,
      },
    });
  } else {
    const items = await Item.find(
      conditionArray.length > 0 ? { $and: conditionArray } : {}
    )
      .sort(sort ? sort + " _id" : "nameAr _id")
      .select(
        "_id name caliber formula company warehouses price customer_price logo_url packing isActive  composition barcode barcodeTwo nameAr"
      )
      .populate({
        path: "company",
        model: "User",
        select: "_id name allowAdmin logo_url logo_url",
      })
      .populate({
        path: "warehouses.warehouse",
        model: "User",
        select:
          "_id name city isActive  costOfDeliver invoiceMinTotal fastDeliver payAtDeliver includeInPointSystem pointForAmount amountToGetPoint",
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
  }

  // items = await Item.find(
  //   conditionArray.length > 0 ? { $and: conditionArray } : {}
  // )
  //   .sort(sort ? sort + " _id" : "nameAr _id")
  //   .select(
  //     "_id name caliber formula company warehouses price customer_price logo_url packing isActive  composition barcode barcodeTwo nameAr"
  //   )
  //   .populate({
  //     path: "company",
  //     model: "User",
  //     select: "_id name allowAdmin logo_url logo_url",
  //   })
  //   .populate({
  //     path: "warehouses.warehouse",
  //     model: "User",
  //     select:
  //       "_id name city isActive  costOfDeliver invoiceMinTotal fastDeliver payAtDeliver includeInPointSystem pointForAmount amountToGetPoint",
  //   })
  //   .skip((page - 1) * (limit * 1))
  //   .limit(limit * 1);

  // res.status(200).json({
  //   status: "success",
  //   count,
  //   data: {
  //     items,
  //   },
  // });
});

exports.filterItemsByName = catchAsync(async (req, res, next) => {
  const { page, limit, itemName } = req.query;

  const result = await Item.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: `${itemName}`, $options: "i" } },
          { nameAr: { $regex: `${itemName}`, $options: "i" } },
          { composition: { $regex: `${itemName}`, $options: "i" } },
          { barcode: itemName },
          { barcodeTwo: itemName },
        ],
      },
    ],
  })
    .select(
      "_id name caliber formula company warehouses price customer_price logo_url packing isActive  composition barcode barcodeTwo nameAr"
    )
    .populate({
      path: "company",
      model: "User",
      select: "_id name allowAdmin logo_url",
    })
    .populate({
      path: "warehouses.warehouse",
      model: "User",
      select:
        "_id name city isActive  costOfDeliver invoiceMinTotal fastDeliver payAtDeliver includeInPointSystem pointForAmount amountToGetPoint",
    })
    .sort("_id");

  let searchNameResults = [];
  let searchNameArResults = [];
  let searchCompositionResults = [];

  result.forEach((item) => {
    if (item.name.toLowerCase().includes(itemName.toLowerCase())) {
      searchNameResults.push(item);
    } else if (item.nameAr.toLowerCase().includes(itemName.toLowerCase())) {
      searchNameArResults.push(item);
    } else {
      searchCompositionResults.push(item);
    }
  });
  const startIndex = (page - 1) * (limit * 1);
  const endIndex = startIndex + limit * 1;

  const finalResult = [
    ...searchNameResults,
    ...searchNameArResults,
    ...searchCompositionResults,
  ].slice(startIndex, endIndex);

  res.status(200).json({
    status: "success",
    count: result.length,
    data: {
      items: finalResult,
    },
  });
});

exports.getItemsSmallDetails = catchAsync(async (req, res, next) => {
  const items = await Item.find({ isActive: true }).select(
    "_id name  composition barcode barcodeTwo nameAr company warehouses"
  );

  res.status(200).json({
    status: "success",
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
      "_id name caliber formula company warehouses price customer_price logo_url packing isActive  composition indication barcode barcodeTwo nameAr"
    )
    .populate({
      path: "company",
      model: "User",
      select: "_id name allowAdmin logo_url",
    })
    .populate({
      path: "warehouses.warehouse",
      model: "User",
      select:
        "_id name city isActive  costOfDeliver invoiceMinTotal fastDeliver payAtDeliver includeInPointSystem pointForAmount amountToGetPoint",
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
    "_id name caliber formula indication composition packing price customer_price barcode barcodeTwo nameAr company"
  );

  res.status(200).json({
    status: "success",
    data: {
      items,
    },
  });
});

exports.getAllItemsForWarehouse = catchAsync(async (req, res, next) => {
  const items = await Item.find({
    "warehouses.warehouse": req.params.warehouseId,
  }).select(
    "_id name caliber formula indication composition packing price customer_price barcode barcodeTwo nameAr company"
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
        barcodeTwo: items[i].barcodeTwo,
        nameAr: items[i].nameAr,
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

  const { itemId } = req.params;

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
  let findItem = await Item.findById(itemId);

  // if the item doesn't exist
  if (!findItem) {
    return next(new AppError(`No item found`, 400));
  }

  findItem.warehouses = findItem.warehouses.map((w) => {
    if (w.warehouse == warehouseId) {
      return {
        warehouse: warehouseId,
        offer: w.offer,
        maxQty: qty,
        points: w.points,
      };
    } else return w;
  });

  await findItem.save();

  const newItem = await Item.findById(itemId)
    .select(
      "_id name caliber formula company warehouses price customer_price logo_url packing isActive  composition barcode barcodeTwo nameAr"
    )
    .populate({
      path: "company",
      model: "User",
      select: "_id name allowAdmin logo_url",
    })
    .populate({
      path: "warehouses.warehouse",
      model: "User",
      select:
        "_id name city isActive  costOfDeliver invoiceMinTotal fastDeliver payAtDeliver includeInPointSystem pointForAmount amountToGetPoint",
    });

  res.status(200).json({
    status: "success",
    data: {
      itemId,
      newItem,
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
      return {
        warehouse: warehouseId,
        offer: offer,
        maxQty: w.maxQty,
        points: w.points,
      };
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

exports.changePoints = catchAsync(async (req, res, next) => {
  // get the item id from request parameters
  const { itemId } = req.params;

  // get the warehouseId and caliber from request body
  const { warehouseId, points } = req.body;

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
      return {
        warehouse: warehouseId,
        points: points,
        maxQty: w.maxQty,
        offer: w.offer,
      };
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
  const { itemId } = req.params;

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
  const { data, rest } = req.body;

  const modifiedData = data.map((d) => {
    return {
      ...d,
      _id: mongoose.Types.ObjectId(d._id),
      company: mongoose.Types.ObjectId(d.company),
      warehouses:
        d.warehouses.length > 0
          ? d.warehouses.map((w) => {
              return {
                ...w,
                _id: mongoose.Types.ObjectId(w._id),
                warehouse: mongoose.Types.ObjectId(w.warehouse),
                offer: w.offer
                  ? {
                      ...w.offer,
                      offers: w.offer.offers
                        ? w.offer.offers.map((off) => {
                            return {
                              ...off,
                              _id: mongoose.Types.ObjectId(off._id),
                            };
                          })
                        : [],
                    }
                  : null,
              };
            })
          : [],
    };
  });

  try {
    if (rest) {
      await Item.deleteMany({});

      await Item.insertMany(modifiedData);
    } else {
      await Item.insertMany(modifiedData);
    }
  } catch (err) {
    return next(new AppError("error occured during restore some data", 401));
  }

  res.status(200).json({
    status: "success",
  });
});

exports.getItemsWithOffer = catchAsync(async (req, res, next) => {
  const { page, limit, itemName, searchWarehousesIds, searchCompaniesIds } =
    req.query;

  let aggregateCondition = [];
  // let data = [];

  if (searchCompaniesIds) {
    aggregateCondition.push({
      $match: {
        company: {
          $in: searchCompaniesIds.map((id) => mongoose.Types.ObjectId(id)),
        },
      },
    });
  }

  if (itemName?.trim().length > 0) {
    aggregateCondition.push({
      $match: {
        $or: [
          { name: { $regex: itemName, $options: "i" } },
          { nameAr: { $regex: itemName, $options: "i" } },
          { composition: { $regex: itemName, $options: "i" } },
          { barcode: itemName },
          { barcodeTwo: itemName },
        ],
      },
    });
  }

  aggregateCondition.push({
    $unwind: {
      path: "$warehouses",
      preserveNullAndEmptyArrays: true,
    },
  });

  let userW = [];
  const { type, city } = req.user;

  if (type === "admin") {
    userW = await User.find({
      type: "warehouse",
      isActive: true,
    }).select("_id");
    userW = userW.map((w) => w._id);
  }

  if (type === "pharmacy") {
    userW = await User.find({
      $and: [
        {
          type: "warehouse",
        },
        { isActive: true },
        { city: city },
      ],
    }).select("_id");
    userW = userW.map((w) => w._id);
  }

  aggregateCondition.push({
    $match: {
      "warehouses.offer.mode": {
        $ne: null,
      },
    },
  });

  // if (userW.length > 0) {
  aggregateCondition.push({
    $match: {
      "warehouses.warehouse": {
        $in: userW.map((id) => mongoose.Types.ObjectId(id)),
      },
    },
  });
  // }

  if (searchWarehousesIds) {
    aggregateCondition.push({
      $match: {
        "warehouses.warehouse": {
          $in: searchWarehousesIds.map((id) => mongoose.Types.ObjectId(id)),
        },
      },
    });
  }

  aggregateCondition.push({
    $lookup: {
      from: "users",
      localField: "company",
      foreignField: "_id",
      as: "company",
    },
  });

  aggregateCondition.push({
    $lookup: {
      from: "users",
      localField: "warehouses.warehouse",
      foreignField: "_id",
      as: "warehouses.warehouse",
    },
  });

  aggregateCondition.push({
    $project: {
      _id: 1,
      price: 1,
      customer_price: 1,
      logo_url: 1,
      isActive: 1,
      barcode: 1,
      barcodeTwo: 1,
      name: 1,
      formula: 1,
      packing: 1,
      composition: 1,
      "company._id": 1,
      "company.name": 1,
      caliber: 1,
      indication: 1,
      warehouses: 1,
      nameAr: 1,
      warehouses: {
        "warehouse._id": 1,
        "warehouse.name": 1,
        "warehouse.city": 1,
        "warehouse.isActive": 1,
        "warehouse.costOfDeliver": 1,
        "warehouse.invoiceMinTotal": 1,
        "warehouse.fastDeliver": 1,
        maxQty: 1,
        orderNumber: 1,
        offer: 1,
        points: 1,
      },
    },
  });

  const countAggregateCondition = [
    ...aggregateCondition,
    {
      $count: "itemName",
    },
  ];

  const count = await Item.aggregate(countAggregateCondition);

  if (itemName?.trim().length > 0) {
    const data = await Item.aggregate(aggregateCondition);

    const searchNameResults = [];
    const searchNameArResults = [];
    const searchCompositionResults = [];

    data.forEach((item) => {
      if (item.name.toLowerCase().includes(itemName.toLowerCase())) {
        searchNameResults.push(item);
      } else if (item.nameAr.toLowerCase().includes(itemName.toLowerCase())) {
        searchNameArResults.push(item);
      } else {
        searchCompositionResults.push(item);
      }
    });
    const startIndex = (page - 1) * (limit * 1);
    const endIndex = startIndex + limit * 1;

    const filteredData = [
      ...searchNameResults,
      ...searchNameArResults,
      ...searchCompositionResults,
    ].slice(startIndex, endIndex);

    res.status(200).json({
      status: "success",
      count: count[0]?.itemName ? count[0].itemName : 0,
      data: {
        data: filteredData,
      },
    });
  } else {
    aggregateCondition.push({
      $skip: (page - 1) * (limit * 1),
    });

    aggregateCondition.push({ $limit: limit * 1 });

    const data = await Item.aggregate(aggregateCondition);

    res.status(200).json({
      status: "success",
      count: count[0]?.itemName ? count[0].itemName : 0,
      data: {
        data,
      },
    });
  }

  // res.status(200).json({
  //   status: "success",
  //   count: count[0]?.itemName ? count[0].itemName : 0,
  //   data: {
  //     data,
  //   },
  // });
});

exports.getItemsWithPoints = catchAsync(async (req, res, next) => {
  const { page, limit, itemName, searchWarehousesIds, searchCompaniesIds } =
    req.query;

  let aggregateCondition = [];
  // let data = [];

  if (searchCompaniesIds) {
    aggregateCondition.push({
      $match: {
        company: {
          $in: searchCompaniesIds.map((id) => mongoose.Types.ObjectId(id)),
        },
      },
    });
  }

  if (itemName?.trim().length > 0) {
    aggregateCondition.push({
      $match: {
        $or: [
          { name: { $regex: itemName, $options: "i" } },
          { nameAr: { $regex: itemName, $options: "i" } },
          { composition: { $regex: itemName, $options: "i" } },
          { barcode: itemName },
          { barcodeTwo: itemName },
        ],
      },
    });
  }

  aggregateCondition.push({
    $unwind: {
      path: "$warehouses",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregateCondition.push({
    $match: {
      "warehouses.points": { $elemMatch: { $exists: true } },
    },
  });

  let userW = [];
  const { type, city } = req.user;

  if (type === "admin") {
    userW = await User.find({
      type: "warehouse",
      isActive: true,
    }).select("_id");
    userW = userW.map((w) => w._id);
  }

  if (type === "pharmacy") {
    userW = await User.find({
      $and: [
        {
          type: "warehouse",
        },
        { isActive: true },
        { city: city },
      ],
    }).select("_id");
    userW = userW.map((w) => w._id);
  }

  // if (userW.length > 0) {
  aggregateCondition.push({
    $match: {
      "warehouses.warehouse": {
        $in: userW.map((id) => mongoose.Types.ObjectId(id)),
      },
    },
  });
  // }

  if (searchWarehousesIds) {
    aggregateCondition.push({
      $match: {
        "warehouses.warehouse": {
          $in: searchWarehousesIds.map((id) => mongoose.Types.ObjectId(id)),
        },
      },
    });
  }

  aggregateCondition.push({
    $lookup: {
      from: "users",
      localField: "company",
      foreignField: "_id",
      as: "company",
    },
  });

  aggregateCondition.push({
    $lookup: {
      from: "users",
      localField: "warehouses.warehouse",
      foreignField: "_id",
      as: "warehouses.warehouse",
    },
  });

  aggregateCondition.push({
    $project: {
      _id: 1,
      price: 1,
      customer_price: 1,
      logo_url: 1,
      isActive: 1,
      barcode: 1,
      barcodeTwo: 1,
      name: 1,
      formula: 1,
      packing: 1,
      composition: 1,
      "company._id": 1,
      "company.name": 1,
      caliber: 1,
      indication: 1,
      warehouses: 1,
      nameAr: 1,
      warehouses: {
        "warehouse._id": 1,
        "warehouse.name": 1,
        "warehouse.city": 1,
        "warehouse.isActive": 1,
        "warehouse.costOfDeliver": 1,
        "warehouse.invoiceMinTotal": 1,
        "warehouse.fastDeliver": 1,
        maxQty: 1,
        orderNumber: 1,
        offer: 1,
        points: 1,
      },
    },
  });

  const countAggregateCondition = [
    ...aggregateCondition,
    {
      $count: "itemName",
    },
  ];

  const count = await Item.aggregate(countAggregateCondition);

  if (itemName?.trim().length > 0) {
    const data = await Item.aggregate(aggregateCondition);

    const searchNameResults = [];
    const searchNameArResults = [];
    const searchCompositionResults = [];

    data.forEach((item) => {
      if (item.name.toLowerCase().includes(itemName.toLowerCase())) {
        searchNameResults.push(item);
      } else if (item.nameAr.toLowerCase().includes(itemName.toLowerCase())) {
        searchNameArResults.push(item);
      } else {
        searchCompositionResults.push(item);
      }
    });

    const startIndex = (page - 1) * (limit * 1);
    const endIndex = startIndex + limit * 1;

    const filteredData = [
      ...searchNameResults,
      ...searchNameArResults,
      ...searchCompositionResults,
    ].slice(startIndex, endIndex);

    res.status(200).json({
      status: "success",
      count: count[0]?.itemName ? count[0].itemName : 0,
      data: {
        data: filteredData,
      },
    });
  } else {
    aggregateCondition.push({
      $skip: (page - 1) * (limit * 1),
    });

    aggregateCondition.push({ $limit: limit * 1 });

    const data = await Item.aggregate(aggregateCondition);

    res.status(200).json({
      status: "success",
      count: count[0]?.itemName ? count[0].itemName : 0,
      data: {
        data,
      },
    });
  }

  // res.status(200).json({
  //   status: "success",
  //   count: count[0]?.itemName ? count[0].itemName : 0,
  //   data: {
  //     data,
  //   },
  // });
});
