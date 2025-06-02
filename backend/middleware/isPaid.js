const hasPaidAccess = async (userId, itemType, itemId) => {
  return await Transaction.exists({
    userId,
    itemType,
    itemId,
    status: "paid"
  });
};
