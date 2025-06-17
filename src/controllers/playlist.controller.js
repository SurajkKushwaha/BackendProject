import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user?._id;
  if (!userId) throw new ApiError(404, "user not verified");
  if (!name?.trim()) throw new ApiError(404, "playlist name is required");
  if (!description?.trim()) throw new ApiError(404, "playlist description is required");

  const playlist = await Playlist.findOne({
      owner:userId,
      name:name
  })
  if(playlist) throw new ApiError(404,'playlist already exists')

  const createdPlaylist=   await Playlist.create({
        name:name,
        description:description,
        owner:userId
    })

    return res.json(200).json(new ApiResponse(200,createPlaylist,'created palylist successfully')) 
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if(!isValidObjectId(userId))throw new ApiError(404,'invalid user id')
  
  const allPlaylists = await Playlist.find({
    owner:userId
  }).sort({name:1}).lean()
  
   if (allPlaylists.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], 'No playlist to show'));
  }
  return res.status(200).json(new ApiResponse(200,allPlaylists,'fetched all playlist'))  
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const userId = req.user?._id;

  if (!userId) throw new ApiError(404, "user not verified");
   if(!isValidObjectId(playlistId))throw new ApiError(404,'invalid playlist id')
  //TODO: get playlist by id
 const existingPlaylist = await Playlist.findOne({
    _id:playlistId,
    owner:userId
 }).lean()
 if(!existingPlaylist)throw new ApiError(404,'playlist not found')
 return res.status(200).json(new ApiResponse(200,existingPlaylist,'fetched  playlist'))


});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user?._id;
   if (!userId) throw new ApiError(404, "user not verified");
   if(!isValidObjectId(playlistId))throw new ApiError(404,'invalid playlist id')
    if(!isValidObjectId(videoId))throw new ApiError(404,'invalid video id')
    
    const playlist = await Playlist.findOne({
        owner:userId,
        _id:playlistId
    })
    if(!playlist) throw new ApiError(404,'playlist does not exist')    


    
   const alreadyPresent =  playlist.videos.some((id)=>id.toString()===videoId)   
   if(alreadyPresent){
     return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Video is already in playlist"));
   }


   playlist.videos.push(videoId)
   await playlist.save({validateBeforeSave:false})   
   
   return res.status(200).json(new ApiResponse(200, playlist, 'Video added to playlist'));



});






const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
   const userId = req.user?._id;
   if (!userId) throw new ApiError(404, "user not verified");
   if(!isValidObjectId(playlistId))throw new ApiError(404,'invalid playlist id')
    if(!isValidObjectId(videoId))throw new ApiError(404,'invalid video id')
    
    const playlist = await Playlist.findOne({
        owner:userId,
        _id:playlistId
    })
    if(!playlist) throw new ApiError(404,'playlist does not exist')    


    
   const alreadyPresent =  playlist.videos.some((id)=>id.toString()===videoId)   
   if(!alreadyPresent)throw new ApiError(404,'video does not exist in playlist')


   playlist.videos = playlist.videos.filter((vid)=>vid.toString()!==videoId)
   await playlist.save({validateBeforeSave:false})   
   
   return res.status(200).json(new ApiResponse(200, playlist, 'Video removed to playlist'));


  

});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const userId = req.user?._id;
    if (!userId) throw new ApiError(404, "user not verified");
   if(!isValidObjectId(playlistId))throw new ApiError(404,'invalid playlist id')
   
    const existingPlaylist = await Playlist.findOne({
        _id:playlistId,
        owner:userId
    })
    if(!existingPlaylist) throw new ApiError(404,'playlist does not exist')
    
      await existingPlaylist.deleteOne()  
        return res.status(200).json(new ApiResponse(200,{}, 'playlist removed successfully'));

});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  const userId = req.user?._id;
   if (!userId) throw new ApiError(404, "user not verified");
   if(!isValidObjectId(playlistId))throw new ApiError(404,'invalid playlist id')
  //TODO: update playlist
if(!name?.trim())throw new ApiError(400,'provide new name details')
    if(!description?.trim())throw new ApiError(400,'provide new description details')
 
if(name && description){
const playlist = await Playlist.findOne({
    owner:userId,
    _id:playlistId
})
if(!playlist)throw new ApiError(404,'playlist should exist--no playlist found')

 playlist.name = name;
 playlist.description= description
 await playlist.save({validateBeforeSave:false})   
   return res.status(200).json(new ApiResponse(200,playlist, 'playlist name and description updated successfully'));

}        
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
