# Extend the official n8n image with jsonata pre-installed
FROM n8nio/n8n:1.120.4

# Switch to root to install packages
USER root

# Install jsonata globally
RUN npm install -g jsonata

# Switch back to node user for security
USER node
