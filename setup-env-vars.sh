#!/bin/bash
# Setup environment variables for HlumisaProperties.Api from appsettings.json
# Usage: source setup-env-vars.sh
# Or: bash setup-env-vars.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPSETTINGS="$SCRIPT_DIR/HlumisaProperties.Api/appsettings.json"

if [ ! -f "$APPSETTINGS" ]; then
    echo "Error: $APPSETTINGS not found"
    return 1 2>/dev/null || exit 1
fi

# Helper to extract value from appsettings.json and export it
extract_and_export() {
    local key_path="$1"
    local var_name="$2"
    local value
    value=$(grep -oP "(?<=${key_path}[\"']: [\"'])[^\"']+" "$APPSETTINGS" 2>/dev/null || true)
    if [ -n "$value" ]; then
        export "$var_name=$value"
        echo "Exported $var_name"
    else
        echo "Warning: $var_name not found in appsettings.json"
    fi
}

echo "Setting environment variables from $APPSETTINGS..."

# Logging
export Logging__LogLevel__Default="Information"
export Logging__LogLevel__Microsoft.AspNetCore="Warning"

# Twilio
extract_and_export "Twilio" "Twilio__AccountSid"
extract_and_export "MessagingSenderId" "Twilio__MessagingSenderId"
extract_and_export "WhatsAppFromNumber" "Twilio__WhatsAppFromNumber"
extract_and_export "AuthToken" "Twilio__AuthToken"

# LLM
extract_and_export "LLM" "LLM__BaseUrl"
extract_and_export "Model" "LLM__Model"

# Facebook
extract_and_export "Facebook" "Facebook__VerifyToken"

# ConnectionStrings - DefaultConnection
export ConnectionStrings__DefaultConnection="Server=63.141.255.202;Port=3306;Database=hlumisapropertiesdb;User=zola;Password=Zola123!;"

# JWT
extract_and_export "Jwt" "Jwt__Secret"
extract_and_export "Issuer" "Jwt__Issuer"
extract_and_export "Audience" "Jwt__Audience"

# AdminUser
extract_and_export "AdminUser" "AdminUser__Email"
extract_and_export "Password" "AdminUser__Password"
extract_and_export "FirstName" "AdminUser__FirstName"
extract_and_export "LastName" "AdminUser__LastName"

echo ""
echo "Environment variables set. Run 'dotnet run' from HlumisaProperties.Api/ to use them."