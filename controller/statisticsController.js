const User = require("../models/userModel");
const Item = require("../models/itemModel");
const Statistic = require("../models/statisticModel");
const catchAsync = require("../utils/catchAsync");

exports.addStatistics = catchAsync(async (req, res, next) => {
  const body = req.body;
  await Statistic.create(body);

  res.status(200).json({
    status: "success",
  });
});

exports.getStatistics = catchAsync(async (req, res, next) => {
  const statistics = await Statistic.find({});
  res.status(200).json({
    status: "success",
    data: {
      statistics,
    },
  });
});

exports.getAllStatistics = catchAsync(async (req, res, next) => {
  const statistics = await Statistic.find({});
  res.status(200).json({
    status: "success",
    data: {
      data: statistics,
    },
  });
});

exports.getUsersStatistics = catchAsync(async (req, res, next) => {
  const query = req.query;
  const field = query.field;
  const page = query.page;
  const limit = query.limit;

  let aggregateCondition = [];

  if (field && field === "signinDates") {
    aggregateCondition.push({
      $unwind: {
        path: "$signinDates",
      },
    });
  } else if (field && field === "selectedDates") {
    aggregateCondition.push({
      $unwind: {
        path: "$selectedDates",
      },
    });
  } else if (field && field === "orderDates") {
    aggregateCondition.push({
      $unwind: {
        path: "$orderDates",
      },
    });
  } else if (field && field === "addedToFavoriteDates") {
    aggregateCondition.push({
      $unwind: {
        path: "$addedToFavoriteDates",
      },
    });
  }

  // search by name
  if (query.name) {
    aggregateCondition.push({
      $match: { name: { $regex: query.name, $options: "i" } },
    });
  }

  if (query.date) {
    aggregateCondition.push({
      $match: {
        [field]: {
          $gte: new Date(query.date),
          $lt: new Date(query.date1),
        },
      },
    });
  }

  aggregateCondition.push({
    $group: {
      _id: "$_id",
      count: {
        $sum: 1,
      },
      dates: {
        $addToSet: `$${field}`,
      },
      name: {
        $first: "$name",
      },
    },
  });

  const countAggregateCondition = [
    ...aggregateCondition,
    {
      $count: "name",
    },
  ];

  aggregateCondition.push({
    $sort: { count: -1, name: 1 },
  });

  aggregateCondition.push({
    $skip: (page - 1) * (limit * 1),
  });

  aggregateCondition.push({ $limit: limit * 1 });

  const data = await User.aggregate(aggregateCondition);
  const count = await User.aggregate(countAggregateCondition);

  res.status(200).json({
    status: "success",
    count: count[0]?.name ? count[0].name : 0,
    data: {
      data,
    },
  });
});

exports.getItemsStatistics = catchAsync(async (req, res, next) => {
  const query = req.query;
  const field = query.field;
  const page = query.page;
  const limit = query.limit;

  let aggregateCondition = [];

  if (field && field === "selectedDates") {
    aggregateCondition.push({
      $unwind: {
        path: "$selectedDates",
      },
    });
  } else if (field && field === "addedToCartDates") {
    aggregateCondition.push({
      $unwind: {
        path: "$addedToCartDates",
      },
    });
  } else if (field && field === "addedToFavoriteDates") {
    aggregateCondition.push({
      $unwind: {
        path: "$addedToFavoriteDates",
      },
    });
  }

  // search by name
  if (query.name) {
    aggregateCondition.push({
      $match: { name: { $regex: query.name, $options: "i" } },
    });
  }

  if (query.date) {
    aggregateCondition.push({
      $match: {
        [field]: {
          $gte: new Date(query.date),
          $lt: new Date(query.date1),
        },
      },
    });
  }

  // search in a specific date

  aggregateCondition.push({
    $group: {
      _id: "$_id",
      count: {
        $sum: 1,
      },
      dates: {
        $addToSet: `$${field}`,
      },
      name: {
        $first: "$name",
      },
    },
  });

  const countAggregateCondition = [
    ...aggregateCondition,
    {
      $count: "name",
    },
  ];

  aggregateCondition.push({
    $sort: { count: -1, name: 1 },
  });

  aggregateCondition.push({
    $skip: (page - 1) * (limit * 1),
  });

  aggregateCondition.push({ $limit: limit * 1 });

  const data = await Item.aggregate(aggregateCondition);
  const count = await Item.aggregate(countAggregateCondition);

  res.status(200).json({
    status: "success",
    count: count[0]?.name ? count[0].name : 0,
    data: {
      data,
    },
  });
});

exports.restoreData = catchAsync(async (req, res, next) => {
  const body = req.body;

  await Statistic.deleteMany({});

  await Statistic.insertMany(body);

  res.status(200).json({
    status: "success",
  });
});
