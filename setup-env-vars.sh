#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found"
    exit 1
fi

while IFS= read -r line || [ -n "$line" ]; do
    key="${line%%=*}"
    value="${line#*=}"

    value="${value#\"}"
    value="${value%\"}"
    value="${value#\'}"
    value="${value%\'}"

    case "$key" in
        TWILIO_ACCOUNT_SID) export Twilio__AccountSid="$value" ;;
        TWILIO_AUTH_TOKEN) export Twilio__AuthToken="$value" ;;
        TWILIO_MESSAGING_SENDER_ID) export Twilio__MessagingSenderId="$value" ;;
        TWILIO_WHATSAPP_FROM_NUMBER) export Twilio__WhatsAppFromNumber="$value" ;;
        FACEBOOK_VERIFY_TOKEN) export Facebook__VerifyToken="$value" ;;
        FACEBOOK_PAGE_ACCESS_TOKEN) export Facebook__PageAccessToken="$value" ;;
        FACEBOOK_PAGE_ID) export Facebook__PageId="$value" ;;
        CONNECTION_STRING) export ConnectionStrings__DefaultConnection="$value" ;;
        JWT_SECRET) export Jwt__Secret="$value" ;;
        JWT_ISSUER) export Jwt__Issuer="$value" ;;
        JWT_AUDIENCE) export Jwt__Audience="$value" ;;
        ADMIN_EMAIL) export AdminUser__Email="$value" ;;
        ADMIN_PASSWORD) export AdminUser__Password="$value" ;;
        ADMIN_FIRST_NAME) export AdminUser__FirstName="$value" ;;
        ADMIN_LAST_NAME) export AdminUser__LastName="$value" ;;
    esac
done < "$ENV_FILE"

echo "Environment variables loaded from $ENV_FILE"