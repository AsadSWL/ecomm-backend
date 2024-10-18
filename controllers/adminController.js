
exports.adminAccess = (req, res) => {
  res.status(200).json({ message: 'Welcome Admin' });
};

exports.branchAccess = (req, res) => {
  res.status(200).json({ message: 'Welcome Branch' });
};
