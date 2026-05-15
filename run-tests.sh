#!/bin/bash

# Boxed Products Test Runner Script
# Usage: ./run-tests.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Boxed Products - Test Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Parse command
case "${1:-all}" in
    all)
        echo -e "${BLUE}Running all tests...${NC}"
        npm test
        ;;
    watch)
        echo -e "${BLUE}Running tests in watch mode...${NC}"
        npm run test:watch
        ;;
    coverage)
        echo -e "${BLUE}Running tests with coverage...${NC}"
        npm run test:coverage
        ;;
    unit)
        echo -e "${BLUE}Running unit tests...${NC}"
        npm run test:unit
        ;;
    integration)
        echo -e "${BLUE}Running integration tests...${NC}"
        npm run test:integration
        ;;
    auth)
        echo -e "${BLUE}Running auth tests...${NC}"
        npm run test:auth
        ;;
    product)
        echo -e "${BLUE}Running product tests...${NC}"
        npm run test:product
        ;;
    ui)
        echo -e "${BLUE}Running UI tests...${NC}"
        npm run test:ui
        ;;
    help)
        echo "Usage: ./run-tests.sh [command]"
        echo ""
        echo "Commands:"
        echo "  all          Run all tests (default)"
        echo "  watch        Run tests in watch mode"
        echo "  coverage     Run tests with coverage report"
        echo "  unit         Run unit tests only"
        echo "  integration  Run integration tests only"
        echo "  auth         Run authentication tests"
        echo "  product      Run product tests"
        echo "  ui           Run UI component tests"
        echo "  help         Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./run-tests.sh"
        echo "  ./run-tests.sh coverage"
        echo "  ./run-tests.sh watch"
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Run './run-tests.sh help' for usage information"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Test run complete!${NC}"
