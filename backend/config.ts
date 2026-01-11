// Port Configuration
export const NEXT_PUBLIC_BACKEND_PORT = process.env.NEXT_PUBLIC_BACKEND_PORT || '3000';
export const FRONTEND_PORT = process.env.FRONTEND_PORT || '3001';
// export const NGINX_HOST = process.env.NGINX_HOST || 'twin-nginx';

// API URLs
export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${NEXT_PUBLIC_BACKEND_PORT}/api`;
export const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${FRONTEND_PORT}`;
export const BETTER_AUTH_URI = '/api/auth'
// Database Configuration
export const DB_TYPE = process.env.DB_TYPE || 'mysql';
export const DB_USERNAME = process.env.DB_USERNAME || 'twin_user';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'twin_password';
export const DB_NAME = process.env.DB_NAME || 'twin_commerce';
export const dbRootPassword = process.env.DB_ROOT_PASSWORD || 'root_password';
export const DB_SERVICE_NAME = process.env.DB_SERVICE_NAME || 'twin-db';
export const DB_PORT = Number(process.env.DB_PORT) || 3306;
export const DATABASE_URL = process.env.DATABASE_URL || `mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_SERVICE_NAME}:${DB_PORT}/${DB_NAME}`;

export const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET: string = process.env.GOOGLE_CLIENT_SECRET!;
