import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudninary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Video} from '../models/video.model.js'
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";



const toggleVideoLike = asyncHandler(async (req, res) => {
  const vid_id = req.params.videoId;
  const userID = req.user?._id;

  // Step 1: Check if video exists
  const video = await Video.findById(vid_id);
  if (!video) throw new ApiError(404, "Video does not exist");

  // Step 2: Check if the user already liked this video
  const existingLike = await Like.findOne({
    video: vid_id,
    likedBy: userID
  });

  if (existingLike) {
    // Step 3: Unlike - delete the like document
    await existingLike.deleteOne();

    return res.status(200).json(
      new ApiResponse(200, {}, "Unliked the video")
    );
  } else {
    // Step 4: Like - create a like document
    await Like.create({
      video: vid_id,
      likedBy: userID
    });

    return res.status(200).json(
      new ApiResponse(200, {}, "Liked the video")
    );
  }
});

const toggleCommentLike = asyncHandler(async(req,res)=>{
const comment_id = req.params.commentId
const userId = req.user?._id

 const existingComment = await Like.findOne({
   comment:comment_id,
    likedBy: userId
  })
 if(existingComment){
  await existingComment.deleteOne()
   return res.status(200).json(
      new ApiResponse(200, {}, "Unliked the Comment")
    );
 } 
 else{
 await Like.create({
  comment:comment_id,
  likedBy:userId

 })
  return res.status(200).json(
      new ApiResponse(200, {}, "liked the comment")
    );
 }


})


const toggleTweetLike = asyncHandler(async (req,res)=>{
  const tweetId = req.params.tweetId
  const userId = req.user?._id
      const existingTweet = await Like.findOne({
        tweet:tweetId,
        likedBy:userId
      })

   if(existingTweet){
    await existingTweet.deleteOne();
return res.status(200).json(
      new ApiResponse(200, {}, "Unliked the tweet")
    );
   } 
   else{
    await Like.create({
      tweet:tweetId,
      likedBy:userId
    })
     return res.status(200).json(
      new ApiResponse(200, {}, "liked the tweet")
    );
   }  

})


const getLikedVideos = asyncHandler(async (req,res)=>{
  const userId = req.user?._id;
 const allLikedVideos = await Like.aggregate([
  {
    $match:{
      likedBy:mongoose.Types.ObjectId(userId),
      video:{$ne:null}
    }
  },
  {
    $lookup:{
      from:'videos',
      localField:"video",
      foreignField:"_id",
      as:"videoDetails"
    }
  },
    {
      $unwind: '$videoDetails'      // Flatten videoDetails array
    },
    {
      $project: {
        _id: 0,
        likedAt: '$createdAt',      // Optional: when it was liked
        video: '$videoDetails'      // The full video data
      }
    }
 ])
  
 if(!allLikedVideos) throw new ApiError(401,"Error getting all Liked Videos")
 
  return res.status(200).json(new ApiResponse(200,allLikedVideos,'Fetched All Liked Videos')) 


})

export {toggleVideoLike,toggleCommentLike,toggleTweetLike,getLikedVideos}