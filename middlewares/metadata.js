const requestIp = require('request-ip');
const geoip = require('geoip-lite');
const userAgentParser = require('user-agent');

function addMetadata(req, res, next) {

    const user = authenticateUser();
  const userId = req.user ? req.user.id : null; // Assuming `req.user` contains authenticated user info
  const currentDate = new Date();

  // Capture IP address, geolocation, and user agent
  const ipAddress = requestIp.getClientIp(req);
  const geo = geoip.lookup(ipAddress);
  const userAgent = req.headers['user-agent'];
  const ua = userAgentParser.parse(userAgent);

  // Metadata structure to be added to request body
  const metadata = {
    ip_address: ipAddress ,
    country: geo && geo.country ,
    region: geo && geo.region ,
    city: geo && geo.city ,
    latitude: geo && geo.ll[0] ,
    longitude: geo && geo.ll[1],
    timezone: geo && geo.timezone ,
    isp: geo && geo.org ,
    is_vpn_detected: geo && geo.isVPN ? 1 : 0,  // This would depend on your VPN detection method
    
    // Device and Browser Information
    user_agent: userAgent ,
    browser: ua.family ,
    operating_system: ua.os.family ,
    device_type: ua.device.family ,
    device_brand: ua.device.vendor ,
    device_model: ua.device.model ,
    screen_resolution: req.headers['screen-resolution'] , // Assuming screen resolution is sent in the request header

    // Security and Session Information
    session_id: req.sessionID ,
    failed_login_attempts: req.failedLoginAttempts || 0,  // Assuming the failed login attempts data is in req
    last_failed_login: req.lastFailedLogin || null,  // Assuming last failed login timestamp
    is_two_factor_enabled: req.isTwoFactorEnabled || 0, // Assuming the 2FA status is available
    password_last_changed: req.passwordLastChanged || null,  // Assuming the timestamp for password change
    account_status: req.accountStatus || 'active',  // Assuming account status is available

    // Application & System Information
    app_version: req.headers['app-version'] ,
    api_version: req.headers['api-version'] ,
    platform: req.headers['platform'] ,
    referring_url: req.headers['referer'] ,
    last_page_viewed: req.headers['last-page-viewed'] ,

    // Payment & Order Tracking
    payment_method: req.body.payment_method ,
    transaction_id: req.body.transaction_id ,
    currency: req.body.currency || 'USD',
    order_status: req.body.order_status || 'pending',

    // Status and Audit Logs
    metadata_status: req.body.metadata_status || 'active',
    created_by: userId || 'system',
    updated_by: userId || 'system',
    approved_by: req.body.approved_by || null,
    approval_status: req.body.approval_status || 'pending',
    approval_timestamp: req.body.approval_timestamp || null,
    change_reason: req.body.change_reason || null,
    action_performed: req.body.action_performed || null,
    request_id: req.body.request_id || generateUniqueRequestId(), // A method to generate unique request IDs
    audit_log: req.body.audit_log || {},
    
    created_at: currentDate,
    updated_at: currentDate,
  };

  // Attach metadata to the request body
  req.body.metadata = metadata;

  next();
}

// Helper function to generate a unique request ID (you can replace this with your method)
function generateUniqueRequestId() {
  return 'req_' + Math.random().toString(36).substr(2, 9);
}

module.exports = addMetadata;
