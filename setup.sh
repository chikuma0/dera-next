#!/bin/bash
# Simple setup script to install dependencies and initialize git hooks

# Exit immediately if a command exits with a non-zero status.
set -e

# Install npm dependencies
npm install

# Optional: add other preparation steps here
# e.g., copying env files or initializing databases

printf "\nSetup complete.\n"
