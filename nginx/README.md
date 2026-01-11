# Nginx Configuration with Environment Variables

The nginx configuration now uses environment variables instead of hard-coded values. This makes it easy to customize the configuration without modifying the nginx.conf file.

## Environment Variables

You can customize the following nginx settings in your `.env` file:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NGINX_PORT` | The port nginx listens on inside the container | `80` |
| `NGINX_SERVER_NAME` | The server name for nginx | `localhost` |
| `BACKEND_HOST` | The hostname of the backend service | `twin-backend` |
| `BACKEND_PORT` | The port of the backend service | `3000` |
| `FRONTEND_HOST` | The hostname of the frontend service | `twin-frontend` |
| `FRONTEND_PORT` | The port of the frontend service | `3001` |

## How It Works

1. **Template File**: `nginx/nginx.conf.template` contains the nginx configuration with environment variable placeholders (e.g., `${NGINX_PORT}`)

2. **Entrypoint Script**: `nginx/docker-entrypoint.sh` runs when the container starts and uses `envsubst` to replace the placeholders with actual environment variable values

3. **Generated Config**: The final `nginx.conf` is generated at runtime with your custom values

## Example Usage

To change the nginx port or server name, simply update your `.env` file:

```bash
# .env
NGINX_PORT=8080
NGINX_SERVER_NAME=myapp.local
BACKEND_HOST=twin-backend
BACKEND_PORT=3000
FRONTEND_HOST=twin-frontend
FRONTEND_PORT=3001
```

Then rebuild and restart the nginx container:

```bash
docker-compose up -d --build twin-nginx
```

## Benefits

- ✅ No need to edit nginx.conf directly
- ✅ Easy to switch between different environments (dev, staging, prod)
- ✅ All configuration in one place (.env file)
- ✅ Default values provided for convenience
