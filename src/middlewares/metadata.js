const requestIp = require('request-ip');
const geoip = require('geoip-lite');
const userAgentParser = require('user-agent');
const pool = require('../config/dbConnection'); // Import DB Connection
const jwt = require("jsonwebtoken");

async function addMetadata(req, res, next) {


  try {
    const token = req.header('Authorization');

    const user  = token && jwt.verify(token.replace('Bearer ', ''), process.env.ACCESS_TOKEN_SECRET);
    const userId = user ? user.id : null; // Assuming `req.user` contains authenticated user info
    const currentDate = new Date();

    // Capture IP address, geolocation, and user agent
    const ipAddress = requestIp.getClientIp(req);
    const geo = geoip.lookup(ipAddress);
    const userAgent = req.headers['user-agent'];
    const ua = userAgentParser.parse(userAgent);

    // Metadata structure to be added to request body
    const cleanValue = (value, defaultValue = null) => 
      value !== undefined && value !== null ? value : defaultValue;
    
    const metadata = {
      ip_address: cleanValue(ipAddress),
      country: cleanValue(geo?.country),
      region: cleanValue(geo?.region),
      city: cleanValue(geo?.city),
      latitude: cleanValue(geo?.ll?.[0]),
      longitude: cleanValue(geo?.ll?.[1]),
    
      timezone: cleanValue(geo?.timezone),
      isp: cleanValue(geo?.org),
      is_vpn_detected: cleanValue(geo?.isVPN, 0),  
    
      // Device and Browser Information
      user_agent: cleanValue(userAgent),
      browser: cleanValue(ua?.family),
      operating_system: cleanValue(ua?.os?.family),
      device_type: cleanValue(ua?.device?.family),
      device_brand: cleanValue(ua?.device?.vendor),
      device_model: cleanValue(ua?.device?.model),
      screen_resolution: cleanValue(req.headers['screen-resolution']),
    
      // Security and Session Information
      session_id: cleanValue(req.sessionID),
      failed_login_attempts: cleanValue(req.failedLoginAttempts, 0),  
      last_failed_login: cleanValue(req.lastFailedLogin),
      is_two_factor_enabled: cleanValue(req.isTwoFactorEnabled, 0),
      password_last_changed: cleanValue(req.passwordLastChanged),
      account_status: cleanValue(req.accountStatus, 'active'),
    
      // Application & System Information
      app_version: cleanValue(req.headers['app-version']),
      api_version: cleanValue(req.headers['api-version']),
      platform: cleanValue(req.headers['platform']),
      referring_url: cleanValue(req.headers['referer']),
      last_page_viewed: cleanValue(req.headers['last-page-viewed']),
    
      // Payment & Order Tracking
      payment_method: cleanValue(req.body.payment_method),
      transaction_id: cleanValue(req.body.transaction_id),
      currency: cleanValue(req.body.currency, 'USD'),
      order_status: cleanValue(req.body.order_status, 'pending'),
    
      // Status and Audit Logs
      metadata_status: cleanValue(req.body.metadata_status, 'active'),
      created_by: cleanValue(userId),
      updated_by: cleanValue(userId),
      approved_by: cleanValue(req.body.approved_by),
      approval_status: cleanValue(req.body.approval_status, 'pending'),
      approval_timestamp: cleanValue(req.body.approval_timestamp),
      change_reason: cleanValue(req.body.change_reason),
      action_performed: cleanValue(req.body.action_performed),
      request_id: cleanValue(req.body.request_id, generateUniqueRequestId()),
      audit_log: cleanValue(req.body.audit_log, {}),
    
      created_at: currentDate,
      updated_at: currentDate,
    };
    

    // Attach metadata to the request body
    // req.body.metadata = metadata;

    const metadataQuery = `
    INSERT INTO metadata (entity_type, key_name, key_value, ip_address, country, region, city, timezone, user_agent, device_type, created_by, updated_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const metadataValues = [
      "user", // entity_type
      "registration_info", // key_name
      JSON.stringify(metadata), // key_value (storing metadata as JSON)
      metadata.ip_address,
      metadata.country,
      metadata.region,
      metadata.city,
      metadata.timezone,
      metadata.user_agent,
      metadata.device_type,
      metadata.created_by,
      metadata.updated_by,
      metadata.created_at,
      metadata.updated_at,
    ];


    const [result] = await pool.execute(metadataQuery, metadataValues);
    
    const metadataId = result.insertId;

  } catch (error) {
    console.error("Metadata Error:", error);
    return res.status(500).json({
      message: "Error storing metadata",
      error: error.message,
    });
  }





}

// Helper function to generate a unique request ID (you can replace this with your method)
function generateUniqueRequestId() {
  return 'req_' + Math.random().toString(36).substr(2, 9);
}

module.exports = addMetadata;
