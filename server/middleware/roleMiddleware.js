const requireRole = (role) => {
  return (req, res, next) => {
    // Get Roles
    const userRoles = req.user.role;

    if (userRoles !== role) {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  };
};

export default requireRole;
