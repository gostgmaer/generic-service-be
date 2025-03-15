-- Users Table
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL, 
  role_description TEXT, 
  permissions JSON,  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS users (
  -- id VARCHAR(36) NOT NULL PRIMARY KEY,
 user_id VARCHAR(36) NOT NULL PRIMARY KEY,  -- user_id as the primary key
  
  id INT AUTO_INCREMENT, 
  -- Basic User Information
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  username VARCHAR(50) UNIQUE,
  profile_picture TEXT,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),

  -- Security & Authentication
  password_hash TEXT NOT NULL,
  refresh_token TEXT,
  is_email_verified TINYINT(1) DEFAULT 0,
  is_phone_verified TINYINT(1) DEFAULT 0,
  otp_code VARCHAR(10),
  otp_expiry TIMESTAMP,

  -- Location & Device Info
  country VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(100),
  timezone VARCHAR(50),
  ip_address VARCHAR(45),
  device_info TEXT,

  -- Role & Permissions
  role_id VARCHAR(36), -- Foreign key reference to roles table
  account_status ENUM('active', 'inactive', 'banned', 'pending') DEFAULT 'active',
  banned_reason TEXT,

  -- Subscription & Preferences
  subscription_status ENUM('free', 'premium', 'vip') DEFAULT 'free',
  preferred_language VARCHAR(10) DEFAULT 'en',
  is_dark_mode_enabled TINYINT(1) DEFAULT 0,
  is_marketing_opt_in TINYINT(1) DEFAULT 1,

  -- Social Logins
  google_id VARCHAR(255),
  facebook_id VARCHAR(255),
  github_id VARCHAR(255),

  -- Audit & Logs
  last_login TIMESTAMP NULL DEFAULT NULL,
  failed_login_attempts INT DEFAULT 0,
  account_locked_until TIMESTAMP NULL DEFAULT NULL,
  password_reset_token TEXT,
  password_reset_expiry TIMESTAMP NULL DEFAULT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- Roles Table


-- User Roles Mapping Table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id VARCHAR(36) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  permission_name VARCHAR(50) UNIQUE NOT NULL,
  permission_description TEXT
);

-- Role-Permission Mapping Table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id VARCHAR(36) NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Authentication Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  refresh_token TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- API Logs Table
CREATE TABLE IF NOT EXISTS logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(36),
  action VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Metadata Table
CREATE TABLE IF NOT EXISTS metadata (
  id INT PRIMARY KEY AUTO_INCREMENT,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  key_name VARCHAR(255) NOT NULL,
  key_value TEXT NOT NULL,

  -- Location and Network Tracking
  ip_address VARCHAR(45),
  country VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  timezone VARCHAR(50),
  isp VARCHAR(255),
  is_vpn_detected TINYINT(1) DEFAULT 0,

  -- Device and Browser Information
  user_agent TEXT,
  browser VARCHAR(50),
  operating_system VARCHAR(50),
  device_type VARCHAR(50),
  device_brand VARCHAR(50),
  device_model VARCHAR(50),
  screen_resolution VARCHAR(20),

  -- Security and Session Information
  session_id VARCHAR(50),
  failed_login_attempts INT DEFAULT 0,
  last_failed_login TIMESTAMP NULL DEFAULT NULL,
  is_two_factor_enabled TINYINT(1) DEFAULT 0,
  password_last_changed TIMESTAMP NULL DEFAULT NULL,
  account_status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',

  -- Application & System Information
  app_version VARCHAR(20),
  api_version VARCHAR(20),
  platform VARCHAR(50),
  referring_url TEXT,
  last_page_viewed TEXT,

  -- Payment & Order Tracking
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  currency VARCHAR(10),
  order_status ENUM('pending', 'completed', 'canceled', 'refunded'),

  -- Status and Audit Logs
  metadata_status ENUM('active', 'inactive', 'deleted', 'archived', 'pending_review') DEFAULT 'active', 
 created_by VARCHAR(36) NULL,
  updated_by VARCHAR(36) NULL,
  approved_by VARCHAR(36) NULL,
  approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approval_timestamp TIMESTAMP NULL DEFAULT NULL,
  change_reason TEXT,
  action_performed VARCHAR(255),
  request_id VARCHAR(50),
  audit_log JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);
