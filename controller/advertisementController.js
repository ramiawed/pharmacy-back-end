const catchAsync = require("../utils/catchAsync");
const Advertisement = require("../models/advertisementModel");

const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);

exports.getAllAdvertisements = catchAsync(async (req, res, next) => {
  const advertisements = await Advertisement.find({})
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
    });

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

// add a new advertisement logo
exports.addAdvertisement = catchAsync(async (req, res, next) => {
  const {
    file,
    body: { company, warehouse, medicine, name },
  } = req;

  await pipeline(
    file.stream,
    fs.createWriteStream(`${__basedir}/public/advertisements/${name}`)
  );

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
