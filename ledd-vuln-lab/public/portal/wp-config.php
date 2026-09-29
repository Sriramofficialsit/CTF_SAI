<?php
/**
 * LEDD Corp – Employee Management Portal
 * WordPress Configuration File
 *
 * !! AUTO-GENERATED BACKUP by Duplicator Plugin v1.3.26 !!
 * !! Created: 2024-10-14 03:22:17 UTC                   !!
 *
 * IMPORTANT (IT Dept): This file was left here during site migration.
 * Scheduled for deletion post-cutover. Do not share or expose externally.
 *
 * @package WordPress
 */

// =============================================================================
// ** MySQL Database Settings **
// =============================================================================

/** The name of the database for WordPress */
define( 'DB_NAME', 'ledd_portal_db' );

/** MySQL database username */
define( 'DB_USER', 'ledd_db_user' );

/** MySQL database password */
define( 'DB_PASSWORD', 'DB_p@ss_int3rn@l_2024' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost:3306' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. */
define( 'DB_COLLATE', '' );

// =============================================================================
// ** WordPress Admin Credentials **
// NOTE FROM IT: Temporary admin creds stored here during migration setup.
//               REMOVE THIS BLOCK before going live. — Raj, IT Ops, 14 Oct 2024
// =============================================================================
//
//   Portal Admin Login
//   ------------------
//   URL      : /portal/wp-login.php
//   Username : ledd_admin
//   Password : LEDD@secure2024
//
// =============================================================================

// =============================================================================
// ** Authentication Keys and Salts **
// =============================================================================
define( 'AUTH_KEY',         'G#kP!2zQmYuVoL8rNe4dWbFxHcJsA6tI' );
define( 'SECURE_AUTH_KEY',  'Rv7nBq3CpOjKwEg1lTaZy9fXhU5iMsDe' );
define( 'LOGGED_IN_KEY',    'TnKs2HqGjRvCxLo8mEpYbWdN4uAzIcFe' );
define( 'NONCE_KEY',        'Je5rKpUwMbDsGqZoN3fXyTlC8vAiHnEu' );
define( 'AUTH_SALT',        'PoQrMnVbLkHjGfDsAzXcWeTyUiOp1234' );
define( 'SECURE_AUTH_SALT', 'QpRmSoNtLwKuJvIhBgCfDxEyAzWxVuTs' );
define( 'LOGGED_IN_SALT',   'ZxYwVuTsRqPoNmLkJiHgFeDcBaAzYxWv' );
define( 'NONCE_SALT',       'WvUsTrQpOnMlKjIhGfEdCbAaZyXwVuTs' );

// =============================================================================
// ** WordPress Database Table prefix **
// =============================================================================
$table_prefix = 'ledd_';

// =============================================================================
// ** WordPress debugging mode **
// =============================================================================
define( 'WP_DEBUG', false );
define( 'WP_DEBUG_LOG', false );
define( 'WP_DEBUG_DISPLAY', false );

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
