module.exports = function getLimit(limit, paginate) {
  if (paginate && paginate.default) {
    const lower = typeof limit === 'number' && !isNaN(limit) ? limit : paginate.default;
    const upper = typeof paginate.max === 'number' ? paginate.max : Number.MAX_VALUE;
    return Math.min(lower, upper);
  }
  return limit;
};
