import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
   const videoComments =  await Comment.find({
        video:videoId
    })
    //find returns array,if array empty then :
if (videoComments.length === 0) throw new ApiError(404, "No comments found");

   //else
    return res.json(200).json(new ApiResponse(200,videoComments,"Comment fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const videoId = req.params.videoId;
    const userID = req.user?._id;

    if(!content?.trim()) throw new ApiError(404,"NO comment made by user")
    const videoExists =  await Video.findById(videoId)
if(!videoExists) throw new ApiError(404,"video does not exist")
   const comment = await Comment.create({
content:content,
video :videoId,
owner : userID})  

if(!comment) throw new ApiError(500,'error making comment')

 return res.status(200).json(new ApiResponse(200,comment,"Added Comment Successfully"))   

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {content} = req.body
    const userId = req.user?._id
    const commentId= req.params.commentId;
  if(!content?.trim())throw new ApiError(404,"invalid comment updation --no content")
  const comment = await Comment.findById(commentId)
if(!comment) throw new ApiError(404,'comment updation not possible..comment does not exist')
if(comment.owner.toString()!==userId.toString())    throw new ApiError(403, 'You are not authorized to update this comment'); 
if(comment.content.toString()===content.toString()) return res.status(200).json(new ApiResponse(200, {}, "No changes detected"));

  comment.content = content;
  await comment.save( {validateBeforeSave:false});

 return res.status(200).json(new ApiResponse(200,{},"updated Comment Successfully"))   

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    let commentId = req.params.commentId;
    let userId = req.user?._id
    if(!commentId) throw new ApiError(404,'invalid comment id')
     
        let comment = await Comment.findById(commentId)
       if(!comment) throw new ApiError(404,'Comment does not exist')
      
     if(comment.owner.toString()!==userId.toString())    throw new ApiError(403, 'You are not authorized to delete this comment');
    await Comment.findByIdAndDelete(commentId)  
    return res.status(200).json(new ApiResponse(200,{},"deleted Comment Successfully"))   

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }