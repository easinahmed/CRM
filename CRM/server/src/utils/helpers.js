import mongoose from 'mongoose';

export const toObjectId = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
};

export const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const parseSort = (query, defaultSort = '-createdAt') => {
  const sortStr = query.sort || defaultSort;
  const sort = {};
  sortStr.split(',').forEach((s) => {
    if (s.startsWith('-')) {
      sort[s.slice(1)] = -1;
    } else {
      sort[s] = 1;
    }
  });
  return sort;
};

export const parseFilters = (query, allowedFields = []) => {
  const filters = {};
  const { search, page, limit, sort, ...rest } = query;
  allowedFields.forEach((field) => {
    if (rest[field] !== undefined) {
      filters[field] = rest[field];
    }
  });
  return filters;
};

export const buildSearchQuery = (search, fields) => {
  if (!search) return {};
  const regex = { $regex: search, $options: 'i' };
  return {
    $or: fields.map((f) => ({ [f]: regex })),
  };
};
