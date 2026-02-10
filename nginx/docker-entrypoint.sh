#!/bin/sh
set -e

# Substitute environment variables in nginx.conf.template
envsubst '${NGINX_PORT} ${BACKEND_HOST} ${BACKEND_PORT} ${FRONTEND_HOST} ${FRONTEND_PORT}' \
  < /etc/nginx/nginx.conf.template \
  > /etc/nginx/nginx.conf

# Execute the CMD
exec "$@"
