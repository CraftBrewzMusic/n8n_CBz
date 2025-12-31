# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a Docker-based deployment of n8n (workflow automation platform) for CraftBrewz Music. The infrastructure uses Docker Compose to orchestrate:

- **n8n instance**: The main workflow automation service
- **Cloudflare Tunnel**: Secure public access via `n8n.craftbrewzmusic.com`

## Architecture

### Deployment Strategy
This is a containerized deployment (not a development environment). All n8n workflows, custom nodes, and configurations are stored in Docker volumes, not in this repository.

### Key Infrastructure Components

1. **n8n Container** (`n8n-cbz`)
   - Image: `n8nio/n8n:1.120.0` (pinned version)
   - Exposed on port 5678
   - Persistent data in `n8n_data` volume mounted at `/home/node/.n8n`
   - Webhook URL: `https://n8n.craftbrewzmusic.com/`
   - Timezone: America/Denver
   - Runners enabled for task execution
   - Host network access via `host.docker.internal` for reaching local services (LM Studio/Ollama)
   - Restart policy: `unless-stopped` (auto-starts on boot)

2. **Cloudflare Tunnel** (`cloudflared_n8n-cbz`)
   - Provides secure HTTPS access without exposing ports
   - Tunnel token configured in docker-compose.yml
   - Restart policy: `unless-stopped` (auto-starts on boot)

## Common Commands

### Starting/Stopping Services
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart services
docker compose restart

# View logs
docker compose logs -f n8n-cbz
docker compose logs -f cloudflared_n8n-cbz
```

### Managing the Deployment
```bash
# Update to new n8n version (edit docker-compose.yml first)
docker compose pull
docker compose up -d

# Access n8n shell for debugging
docker compose exec n8n-cbz sh

# Backup n8n data
docker run --rm -v n8n_data:/data -v $(pwd):/backup alpine tar czf /backup/n8n-backup.tar.gz -C /data .

# Restore n8n data
docker run --rm -v n8n_data:/data -v $(pwd):/backup alpine tar xzf /backup/n8n-backup.tar.gz -C /data
```

### Inspecting the Environment
```bash
# Check running containers
docker compose ps

# View resource usage
docker stats n8n-cbz

# Inspect volume
docker volume inspect n8n_data
```

## Important Configuration Notes

### Version Pinning
The n8n image is explicitly pinned to version `1.120.0`. When updating, test the new version before deploying to production.

### Auto-Start on Boot
Both services are configured with `restart: unless-stopped`, meaning they will automatically start when Docker starts (e.g., on system boot) and will restart if they crash, unless explicitly stopped by the user.

### Secrets in Repository
**WARNING**: The repository currently contains a sensitive token:
- Cloudflare Tunnel token in `docker-compose.yml:41`

This should be moved to environment files or secrets management.

### Repository Structure
The `.gitignore` file excludes:
- `node_modules/` - Node.js dependencies
- `.env*` - Environment files and secrets
- OS-specific files (`.DS_Store`, `Thumbs.db`)
- IDE files (`.vscode/`, `.idea/`)
- Docker logs and backup files

### Custom Nodes
The docker-compose.yml includes a commented-out volume mount for custom nodes:
```yaml
# - ./custom-nodes:/home/node/.n8n/custom
```
Uncomment and create the directory if deploying custom n8n nodes.

### Network Access
The `extra_hosts` configuration allows n8n workflows to connect to services running on the host machine (like LM Studio or Ollama) via `host.docker.internal`.

## Troubleshooting

### n8n not accessible
1. Check if containers are running: `docker compose ps`
2. Verify Cloudflare tunnel status: `docker compose logs cloudflared_n8n-cbz`
3. Check n8n logs: `docker compose logs n8n-cbz`

### Data persistence issues
- n8n data is stored in the `n8n_data` Docker volume
- Volume persists even when containers are removed
- To fully reset: `docker compose down -v` (WARNING: destroys all workflows)

### Connection to host services
If n8n can't reach services on your host machine:
- Verify service is listening on `0.0.0.0` (not just `127.0.0.1`)
- Use `host.docker.internal` as the hostname in n8n workflows
- Check host firewall settings

### Services not auto-starting on boot
If a service doesn't start automatically after system reboot:
1. Verify the service has a restart policy: `docker inspect <container> --format='{{.HostConfig.RestartPolicy.Name}}'`
2. Ensure docker-compose.yml has `restart: unless-stopped` for the service
3. Apply changes with: `docker compose up -d <service-name>`
