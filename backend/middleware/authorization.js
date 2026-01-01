function checkRole(...allowedRoles) {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;

      console.log("=== Authorization Check ===");
      console.log("User role:", userRole);
      console.log("Allowed roles:", allowedRoles);

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message:
            "Forbidden: You don't have permission to access this resource",
          yourRole: userRole,
          requiredRoles: allowedRoles,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = checkRole;
