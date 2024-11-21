const catchAsync = require("../utils/catchAsync");
const Advertisement = require("../models/advertisementModel");
const mongoose = require("mongoose");
const fs = require("fs");

exports.getAllAdvertisements = catchAsync(async (req, res, next) => {
  const advertisements = await Advertisement.find({})
    .populate({
      path: "company",
      model: "User",
      select: "_id name type allowShowingMedicines city ourCompanies",
      populate: {
        path: "ourCompanies",
        model: "User",
        select: "_id name",
      },
    })
    .populate({
      path: "warehouse",
      model: "User",
      select: "_id name type allowShowingMedicines city ourCompanies",
      populate: {
        path: "ourCompanies",
        model: "User",
        select: "_id name",
      },
    })
    .populate({
      path: "medicine",
      model: "Item",
      select: "_id name",
    })
    .sort("-createdAt _id");

  res.status(200).json({
    status: "success",
    data: {
      advertisements,
    },
  });
});

exports.deleteAdvertisement = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const advertisement = await Advertisement.findById(id);

  const logo_url = advertisement.logo_url;

  if (logo_url && logo_url !== "") {
    if (fs.existsSync(`${__basedir}/public/advertisements/${logo_url}`)) {
      fs.unlinkSync(`${__basedir}/public/advertisements/${logo_url}`);
    }
  }

  await Advertisement.findByIdAndDelete(id);

  res.status(200).json({
    status: "success",
    data: {
      advertisement,
    },
  });
});

exports.addAdvertisement = catchAsync(async (req, res) => {
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
});

exports.getBackupAdvertisements = catchAsync(async (req, res, next) => {
  const advertisements = await Advertisement.find({});

  res.status(200).json({
    status: "success",
    data: {
      data: advertisements,
    },
  });
});

exports.restoreData = catchAsync(async (req, res, next) => {
  const { data, rest } = req.body;

  const modifiedData = data.map((d) => {
    return {
      ...d,
      _id: mongoose.Types.ObjectId(d._id),
      company: d.company ? mongoose.Types.ObjectId(d.company) : null,
      warehouse: d.warehouse ? mongoose.Types.ObjectId(d.warehouse) : null,
      medicine: d.medicine ? mongoose.Types.ObjectId(d.medicine) : null,
    };
  });

  try {
    if (rest) {
      await Advertisement.deleteMany({});
      await Advertisement.insertMany(modifiedData);
    } else {
      await Advertisement.insertMany(modifiedData);
    }
  } catch (err) {
    return next(new AppError("error occured during restore some data", 401));
  }

  res.status(200).json({
    status: "success",
  });
});
