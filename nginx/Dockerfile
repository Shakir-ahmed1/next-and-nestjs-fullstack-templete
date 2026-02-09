FROM nginx:alpine

# Copy production nginx configuration template
COPY nginx.conf.prod.template /etc/nginx/nginx.conf.template

# Create directories for uploads and cache
RUN mkdir -p /usr/share/nginx/html/uploads /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx

# Copy startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:${NEXT_PUBLIC_NGINX_PORT:-8085}/api/health || exit 1

EXPOSE 8085

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

