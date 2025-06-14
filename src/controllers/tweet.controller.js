import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  //check if user exists and content exists and then create tweet
  const userId = req.user?._id;
  //check received content
  const { content } = req.body;
  if (!content?.trim()) throw new ApiError(400, " cannot enter blank tweet");
  const tweet = await Tweet.create({
    content,
    owner: userId,
  });
  if (!tweet) throw new ApiError(500, "error creating tweet");

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "created tweet successfullyy"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  //fetching tweet from db
  const allTweets = await Tweet.find({
    owner: userId,
    isDeleted: false,
  }).lean();
  if (allTweets.length === 0) throw new ApiError(404, "no tweets found");

  return res
    .status(200)
    .json(new ApiResponse(200, allTweets, "Tweets Fetched Successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  //getuser id
  const userId = req.user?._id;
  //get comment id and check content is valid
  const tweetId = req.params.tweetId;
  const { content } = req.body;

  if (!content?.trim())
    throw new ApiError(400, "there should be content inside");

  //find existing tweet
  const existingTweet = await Tweet.findOne({
    _id: tweetId,
    owner: userId,
  });
  if (!existingTweet) throw new ApiError(404, "tweet does not exist");
  // Update and save
  existingTweet.content = content;
  await existingTweet.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, existingTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  //get user id
  const userId = req.user?._id;
  //get tweetid
  const tweetId = req.params.tweetId;
  //find tweet by tweet id and user id and delete the tweet
  const existingTweet = await Tweet.findOne({
    _id: tweetId,
    owner: userId,
    isDeleted: false,
  });
  //using soft delete not hard delete //soft delete means not delting from db but using a flag to indicate delete wa ssuccessfully
  if (!existingTweet)
    throw new ApiError(404, "Tweet not found or already deleted");
  existingTweet.isDeleted = true;
  await existingTweet.save({ validateBeforeSave: false });
  //return response

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
