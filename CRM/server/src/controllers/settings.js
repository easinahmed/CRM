import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import CompanySettings from '../models/CompanySettings.js';

export const get = asyncHandler(async (req, res) => {
  let settings = await CompanySettings.findOne();
  if (!settings) {
    settings = await CompanySettings.create({});
  }
  ApiResponse.success(res, settings);
});

export const update = asyncHandler(async (req, res) => {
  const settings = await CompanySettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
  ApiResponse.success(res, settings, 'Settings updated');
});
