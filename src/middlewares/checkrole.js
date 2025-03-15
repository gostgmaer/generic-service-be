const db = require('../config/dbConnection'); // Import your MySQL connection

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id; // Extract user ID from token
      const [rows] = await db.execute(
        `SELECT r.name FROM roles r 
        JOIN user_roles ur ON ur.role_id = r.id 
        WHERE ur.user_id = ?`,
        [userId]
      );

      const userRoles = rows.map((role) => role.name);
      const hasPermission = userRoles.some((role) => allowedRoles.includes(role));

      if (!hasPermission) {
        return res.status(403).json({ message: 'Access denied' });
      }

      next(); // User has required role, continue execution
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
};

// Example usage in a route
app.get('/admin-dashboard', checkRole(['admin']), (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});
