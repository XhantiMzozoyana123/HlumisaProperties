#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found"
    exit 1
fi

# Export all environment variables directly from .env file
# Variables use double-underscore (__) notation which maps to ASP.NET Core configuration
# e.g., Jwt__Secret -> Jwt:Secret -> Configuration["Jwt:Secret"]
while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    [[ -z "$line" || "$line" =~ ^#.* ]] && continue
    
    # Export the line directly (key=value format)
    export "$line"
done < "$ENV_FILE"

echo "Environment variables loaded from $ENV_FILE"