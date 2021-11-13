const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Advertisement = require("../models/advertisementModel");
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);

exports.getAllAdvertisements = catchAsync((req, res, next) => {
  const advertisements = await Advertisement.find({});

  res.status(200).json({
    status: "success",
    data: {
      advertisements,
    },
  });
});

exports.addAdvertisement = catchAsync((req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      data: [],
    },
  });
});

// change the advertisement logo
exports.uploadImage = catchAsync(async (req, res, next) => {
  const { logo_url, _id } = req.user;
  const {
    file,
    body: { name },
  } = req;

  // if the advertisement have a logo, delete it
  if (logo_url && logo_url !== "") {
    if (fs.existsSync(`${__basedir}/public/${logo_url}`)) {
      fs.unlinkSync(`${__basedir}/public/${logo_url}`);
      await Advertisement.findByIdAndUpdate(_id, { logo_url: "" });
    }
  }

  await pipeline(
    file.stream,
    fs.createWriteStream(`${__basedir}/public/${name}`)
  );

  const updateAdvertisement = await Advertisement.findByIdAndUpdate(
    _id,
    { logo_url: name },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      advertisement: updateAdvertisement,
    },
  });
});
