// Port Configuration
export const NEXT_PUBLIC_BACKEND_PORT = process.env.NEXT_PUBLIC_BACKEND_PORT || '3000';
export const FRONTEND_PORT = process.env.FRONTEND_PORT || '3001';
// export const NGINX_HOST = process.env.NGINX_HOST || 'twin-nginx';

// API URLs
export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${NEXT_PUBLIC_BACKEND_PORT}/api`;
export const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${FRONTEND_PORT}`;
export const BETTER_AUTH_URI = '/api/auth'
// Database Configuration
export const dbType = process.env.DB_TYPE || 'mysql';
export const dbUsername = process.env.DB_USERNAME || 'twin_user';
export const dbPassword = process.env.DB_PASSWORD || 'twin_password';
export const dbName = process.env.DB_NAME || 'twin_commerce';
export const dbRootPassword = process.env.DB_ROOT_PASSWORD || 'root_password';
