export const NEXT_PUBLIC_BACKEND_PORT = process.env.NEXT_PUBLIC_NEXT_PUBLIC_BACKEND_PORT || '3000';

export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${NEXT_PUBLIC_BACKEND_PORT}/api`;
export const NEXT_PUBLIC_NGINX_HOST_NAME = process.env.NEXT_PUBLIC_NGINX_HOST_NAME || 'twin-nginx';
export const NEXT_PUBLIC_NGINX_PORT = process.env.NEXT_PUBLIC_NGINX_PORT || '8084';
export const NEXT_PUBLIC_NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV
export const dashboardPageUri = "/organizations"

export const companyInfo = {
    name: 'Twin-Commerce',
    description: 'Twin-Commerce is a modern e-commerce platform with separated frontend and backend.',
    slug: 'twin-commerce',
    domain: 'twin-commerce.com',
    email: 'support@twin-commerce.com',
}
// Port Configuration
// export const NEXT_PUBLIC_BACKEND_PORT = process.env.NEXT_PUBLIC_BACKEND_PORT || '3000';
// export const FRONTEND_PORT = process.env.FRONTEND_PORT || '3001';

// // OAuth Configuration
// export const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID!;
// export const GOOGLE_CLIENT_SECRET: string = process.env.GOOGLE_CLIENT_SECRET!;

// Other Configuration
// export const PUBLIC_URL: string = process.env.PUBLIC_URL!;
// export const NODE_ENV: string = process.env.NODE_ENV;
// export const FILE_UPLOAD_BASE_DIR: string = process.env.FILE_UPLOAD_BASE_DIR || '';