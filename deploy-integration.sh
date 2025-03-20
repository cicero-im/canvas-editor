#!/bin/bash
# Deployment script for Canvas Editor & Open WebUI integration

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Canvas Editor & Open WebUI Integration Deployment${NC}"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Function to check if a container is running
check_container() {
    if [ "$(docker ps -q -f name=$1)" ]; then
        echo -e "${GREEN}✓ $1 container is running${NC}"
        return 0
    else
        echo -e "${RED}✗ $1 container is not running${NC}"
        return 1
    fi
}

# Step 1: Build and start the containers
echo -e "\n${YELLOW}Step 1: Building and starting containers...${NC}"
docker-compose up -d

# Check if containers are running
echo -e "\n${YELLOW}Checking container status...${NC}"
check_container "openwebui"
OPENWEBUI_RUNNING=$?
check_container "editor"
EDITOR_RUNNING=$?

if [ $OPENWEBUI_RUNNING -eq 0 ] && [ $EDITOR_RUNNING -eq 0 ]; then
    echo -e "\n${GREEN}All containers are running successfully!${NC}"
else
    echo -e "\n${RED}Some containers failed to start. Check the logs with 'docker-compose logs'.${NC}"
    exit 1
fi

# Step 2: Test container network communication
echo -e "\n${YELLOW}Step 2: Testing container network communication...${NC}"
echo "Testing if OpenWebUI can reach Editor..."
docker exec openwebui ping -c 2 editor
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ OpenWebUI can reach Editor${NC}"
else
    echo -e "${RED}✗ OpenWebUI cannot reach Editor. Check network configuration.${NC}"
fi

echo "Testing if Editor can reach OpenWebUI..."
docker exec editor ping -c 2 openwebui
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Editor can reach OpenWebUI${NC}"
else
    echo -e "${RED}✗ Editor cannot reach OpenWebUI. Check network configuration.${NC}"
fi

# Step 3: Test authentication endpoints
echo -e "\n${YELLOW}Step 3: Testing authentication endpoints...${NC}"
echo "Testing OpenWebUI validation endpoint..."
curl -s -X GET http://localhost:8080/api/v1/auth/validate \
  -H "Authorization: Bearer test_token" \
  -i | head -n 20

echo -e "\nTesting Editor return validation..."
curl -s -X POST http://localhost:3000/api/validate-return \
  -H "Content-Type: application/json" \
  -d '{"token":"EDITOR_TOKEN_FOR_user123_1679000000000_EXP_1679003600000"}' \
  -i | head -n 20

# Step 4: Run the integration test script
echo -e "\n${YELLOW}Step 4: Running integration test script...${NC}"
echo "This will test the full authentication flow between services."
read -p "Run integration tests? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    node integration/test-integration.js
fi

# Step 5: Provide next steps
echo -e "\n${YELLOW}Step 5: Next steps${NC}"
echo "1. Access OpenWebUI at http://localhost:8080"
echo "2. Access Canvas Editor at http://localhost:3000"
echo "3. Test the authentication flow by clicking the Editor button in OpenWebUI"
echo "4. Check the logs with 'docker-compose logs -f'"
echo "5. Stop the services with 'docker-compose down'"

echo -e "\n${GREEN}Deployment completed!${NC}"