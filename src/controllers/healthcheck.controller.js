import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: `${process.uptime().toFixed(2)} seconds`,
        environment: process.env.NODE_ENV || "not specified",
      },
      "Server is healthy"
    )
  );
});

export { healthcheck };
