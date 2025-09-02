#!/bin/bash

echo "Testing Role-Based Permissions..."

# Get Finance team token
echo "1. Login as Finance team:"
FINANCE_TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "finance", "password": "finance@321"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Finance token obtained"

# Test: Finance team trying to create project (should be denied)
echo "2. Finance team trying to create project (should be DENIED):"
curl -s -X POST http://localhost:5001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FINANCE_TOKEN" \
  -d '{"nameOfAwardedTender": "Test Project", "siteDetails": "Test Site", "createProjectInDislio": "Yes"}' | head -c 200

echo -e "\n"

# Get Project team token
echo "3. Login as Project team:"
PROJECT_TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "project", "password": "project@123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Project token obtained"

# Test: Project team trying to create project (should be allowed)
echo "4. Project team trying to create project (should be ALLOWED):"
curl -s -X POST http://localhost:5001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROJECT_TOKEN" \
  -d '{"nameOfAwardedTender": "Test Project for Permissions", "siteDetails": "Test Site", "createProjectInDislio": "Yes"}' | head -c 200

echo -e "\n"
echo "Permission tests completed!"
