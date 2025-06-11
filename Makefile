all: generate-certs build start
	@clear	

# Make sure scripts directory exists and has proper permissions
setup-scripts:
	@echo "Scripts directory setup..."
	@chmod +x ./core/scripts/generate-certs.sh
	@chmod +x ./core/scripts/clean-certs.sh

# Generate SSL certificates
generate-certs: setup-scripts
	@echo "Generating SSL certificates..."
	@./core/scripts/generate-certs.sh

# Build and start containers
build:
	@echo "Build containers..."
	docker compose -f ./docker-compose.yml build --no-cache

# Start containers
start:
	@echo "Starting containers..."
	docker compose -f ./docker-compose.yml up -d

# Logs back + front
logs:
	docker logs back
	docker logs front

# Stop and remove all containers
clean-containers:
	@echo "Stopping and removing all containers..."
	-docker stop $(shell docker ps -aq) 2>/dev/null || true
	-docker rm $(shell docker ps -aq) 2>/dev/null || true

# Clean certificates
clean-certs: setup-scripts
	@echo "Cleaning certificate directories..."
	@./core/scripts/clean-certs.sh

clean-docker:
	@echo "Cleaning up Docker environment..."
	docker compose -f ./docker-compose.yml down -v
	-docker volume rm $(docker volume ls -qf "name=sqlite_data") || true
	-docker system prune -af --volumes

# Stop containers
clean:
	docker compose -f ./docker-compose.yml down

# Arrête tout, supprime volumes, cache Docker et fichiers persistants
fclean: clean-containers clean-certs clean-docker
	@clear

# Clean puis rebuild
re: clean all

.PHONY: all logs clean fclean re clean-certs clean-docker setup-scripts generate-certs build start 
