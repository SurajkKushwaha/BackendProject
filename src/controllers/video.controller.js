import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

   const filter = {
    isPublished: true, // Only show published videos to general users
  };
   
  const sortOptions={}
  if(sortBy){
    sortOptions[sortBy] = sortType==='asc'?1:-1
  }
  else{
    
    sortOptions.createdAt = -1; // Default: newest first
  
  }
   const skip = (Number(page) - 1) * Number(limit);

  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(limit))
    .select("-updatedAt ")
    .lean();
   
     const totalVideos = await Video.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      videos,
      totalPages: Math.ceil(totalVideos / limit),
      currentPage: Number(page),
      totalVideos,
    }, "Fetched videos successfully")
  );

});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  const userId = req.user?._id;
  const videoFileLocal = req.files?.videoFile[0]?.path;
  const thumbnailLocal = req.files?.thumbnail[0]?.path;
  if (!videoFileLocal && !thumbnailLocal)
    throw new ApiError(404, "cannot get files of video and thumbnail");

  const [videoFile, thumbnail] = await Promise.all([
    uploadOnCloudinary(videoFileLocal),
    uploadOnCloudinary(thumbnailLocal),
  ]);
  if (!videoFile && !thumbnail)
    throw new ApiError(
      500,
      "failed uploading files of video and thumbnail on cloudinary"
    );

  const video = await Video.create({
    videoFile: videoFile?.url || "",
    thumbnail: thumbnail?.url || "",
    title: title,
    description: description,
    duration: videoFile?.duration,
    isPublished: true,
    owner: userId,
  });

  if (!video) throw new ApiError(500, "error uploading video");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "uploaded video successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
     //TODO: get video by id
  const { videoId } = req.params;
  const userId = req.user?._id

   if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID format");
  }

  const video = await Video.findOne({
    _id:videoId,
      $or: [
      { owner: userId },            // Owner can access any of their videos
      { isPublished: true }         // Others can access only published ones
    ]
  }).lean()

  if(!video) throw new ApiError(404,"invalid video Id")
  
  return res.status(200).json(new ApiResponse(200,video,'fetched video successfully'))  

 
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  const { title, description } = req.body;
  const newThumbnail = req.file?.path;
  //TODO: update video details like title, description, thumbnail

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID format");
  }
    // Check if at least one field is provided
  if (!title && !description && !newThumbnail) {
    throw new ApiError(400, "No data provided to update");
  }

    const updateVid = await Video.findOne({
    _id: videoId,
    owner: userId,
  });

  if (!updateVid) throw new ApiError(404, "video does not exist");
  
  let uploadThumbnail;
  if (newThumbnail){
     uploadThumbnail = await uploadOnCloudinary(newThumbnail);
     updateVid.thumbnail = uploadThumbnail?.url ||updateVid.thumbnail
  }

  if(title&&title.trim())updateVid.title = title.trim()
  if(description&&description.trim()) updateVid.description = description.trim()
 
  
  await updateVid.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, updateVid, "updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "invalid video id");
  }

  const existingVideo = await Video.findOne({
    _id: videoId,
    owner: userId,
  });

  if (!existingVideo) throw new ApiError(404, "video does not exist");

  await existingVideo.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "deleted video successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "invalid video id");
  }

  const video = await Video.findOne({
    _id: videoId,
    owner: userId,
  });

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "toggle ispublished done"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
