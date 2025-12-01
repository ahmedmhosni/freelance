const { runQuery } = require('../db/database');

const logActivity = async (
  userId,
  action,
  entityType,
  entityId,
  details,
  ipAddress
) => {
  try {
    await runQuery(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, action, entityType, entityId, details, ipAddress]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

const activityMiddleware = (action, entityType) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId =
          req.params.id || (typeof data === 'object' && data.id) || null;
        const details = JSON.stringify({ method: req.method, path: req.path });
        const ipAddress = req.ip || req.connection.remoteAddress;

        logActivity(
          req.user.id,
          action,
          entityType,
          entityId,
          details,
          ipAddress
        );
      }
      originalSend.call(this, data);
    };
    next();
  };
};

module.exports = { logActivity, activityMiddleware };
