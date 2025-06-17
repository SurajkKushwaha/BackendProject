import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total videoes,total views,total likes, total subscribers, videos,  etc.
  const userId = req.user?._id;
  const videoStats = await Video.aggregate([
    {
      $match: {
        owner: mongoose.Schema.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        totalViews: {
          $sum: "$views",
        },
        totalVideos: { $sum: 1 },
      },
    },
  ]);
  const videoIds = await Video.find({ owner: userId }).distinct("_id");

  const totalLikes = await Like.countDocuments({
    video: { $in: videoIds },
  });
  const totalSubscribers = await Subscription.countDocuments({
    channel: userId,
  });

  const stats = {
    totalVideos: videoStats[0]?.totalVideos || 0,
    totalViews: videoStats[0]?.totalViews || 0,
    totalLikes,
    totalSubscribers,
  };
  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const userId = req.user?._id;

  const videos = await Video.find({ owner: userId })
    .sort({ createdAt: -1 })
    .select("-updatedAt")
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched"));
});

export { getChannelStats, getChannelVideos };
