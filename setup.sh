#!/bin/bash
# ============================================================
#  Hlumisa Properties — First-time VPS setup (SQLite edition)
#
#  One-shot setup for running the API in Docker on a Linux VPS.
#  Idempotent: safe to re-run at any time.
#
#  Usage:
#    bash setup.sh              (interactive)
#    bash setup.sh --yes        (accept all defaults, no prompts)
#    bash setup.sh --force-env  (regenerate .env even if it exists)
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ACCEPT_DEFAULTS=0
FORCE_ENV=0
for arg in "$@"; do
    case "$arg" in
        --yes|-y) ACCEPT_DEFAULTS=1 ;;
        --force-env) FORCE_ENV=1 ;;
        *) echo "Unknown option: $arg (supported: --yes, --force-env)"; exit 1 ;;
    esac
done

# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------
BOLD='\033[1m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { printf "${GREEN}[setup]${NC} %s\n" "$*"; }
warn() { printf "${YELLOW}[warn ]${NC} %s\n" "$*"; }
die()  { printf "${RED}[error]${NC} %s\n" "$*" >&2; exit 1; }

# Docker Compose command (with sudo when not running as root)
if [ "$(id -u)" -eq 0 ]; then
    DC="docker compose"
elif docker info >/dev/null 2>&1; then
    DC="docker compose"
else
    DC="sudo docker compose"
fi

rand_hex() { # random hex string, fallback chain
    if command -v openssl >/dev/null 2>&1; then openssl rand -hex "$1"
    elif [ -r /dev/urandom ]; then head -c "$1" /dev/urandom | od -An -tx1 | tr -d ' \n'
    else echo ""; fi
}

prompt() { # prompt "label" "default" -> prints value
    local label="$1" def="$2" v=""
    if [ "$ACCEPT_DEFAULTS" -eq 1 ] || [ ! -t 0 ]; then echo "$def"; return; fi
    read -r -p "$(printf "${BOLD}%s${NC} [%s]: " "$label" "$def")" v
    echo "${v:-$def}"
}

prompt_secret() { # prompt_secret "label" "default" -> prints value (hidden input)
    local label="$1" def="$2" v=""
    if [ "$ACCEPT_DEFAULTS" -eq 1 ] || [ ! -t 0 ]; then echo "$def"; return; fi
    read -r -s -p "$(printf "${BOLD}%s${NC} [%s] (input hidden): " "$label" "$def")" v
    echo; echo "${v:-$def}"
}

echo "========================================="
echo "  Hlumisa Properties — Setup (SQLite)"
echo "========================================="

# ------------------------------------------------------------
# Step 1: Prerequisites
# ------------------------------------------------------------
log "Step 1: Checking prerequisites..."
for cmd in git curl docker; do
    command -v "$cmd" >/dev/null 2>&1 || die "'$cmd' is required. Install it and re-run setup."
done
if docker compose version >/dev/null 2>&1 || $DC version >/dev/null 2>&1; then
    log "Docker Compose is available."
else
    die "Docker Compose (v2 plugin) not found. Install with: sudo apt-get install docker-compose-plugin"
fi
log "All prerequisites met."

# ------------------------------------------------------------
# Step 2: Environment file (.env)
# ------------------------------------------------------------
ENV_FILE="$SCRIPT_DIR/.env"
if [ -f "$ENV_FILE" ] && [ "$FORCE_ENV" -eq 0 ]; then
    log "Step 2: .env already exists — keeping it. (Run with --force-env to regenerate.)"
else
    log "Step 2: Creating .env (existing values will be offered as defaults)..."
    [ -f "$ENV_FILE" ] && source "$ENV_FILE" 2>/dev/null || true

    GEN_SECRET="$(rand_hex 32)"
    GEN_VERIFY="$(rand_hex 16)"

    TWILIO_ACCOUNT_SID=$(prompt "Twilio Account SID" "${TWILIO_ACCOUNT_SID:-YOUR_TWILIO_ACCOUNT_SID}")
    TWILIO_AUTH_TOKEN=$(prompt_secret "Twilio Auth Token" "${TWILIO_AUTH_TOKEN:-YOUR_TWILIO_AUTH_TOKEN}")
    TWILIO_MESSAGING_SENDER_ID=$(prompt "Twilio Messaging Sender ID (Facebook Messenger)" "${TWILIO_MESSAGING_SENDER_ID:-messenger:465490577284245}")
    TWILIO_WHATSAPP_FROM_NUMBER=$(prompt "WhatsApp From Number" "${TWILIO_WHATSAPP_FROM_NUMBER:-+14155238886}")
    FACEBOOK_VERIFY_TOKEN=$(prompt "Facebook Webhook Verify Token" "${FACEBOOK_VERIFY_TOKEN:-$GEN_VERIFY}")
    FACEBOOK_PAGE_ACCESS_TOKEN=$(prompt_secret "Facebook Page Access Token" "${FACEBOOK_PAGE_ACCESS_TOKEN:-YOUR_META_PAGE_ACCESS_TOKEN}")
    FACEBOOK_PAGE_ID=$(prompt "Facebook Page ID" "${FACEBOOK_PAGE_ID:-YOUR_FACEBOOK_PAGE_ID}")
    JWT_SECRET=$(prompt_secret "JWT Secret (signing key)" "${JWT_SECRET:-$GEN_SECRET}")
    JWT_ISSUER=$(prompt "JWT Issuer" "${JWT_ISSUER:-api.hlumisaproperties.online}")
    JWT_AUDIENCE=$(prompt "JWT Audience" "${JWT_AUDIENCE:-admin-dashboard.hlumisaproperties.online}")
    ADMIN_EMAIL=$(prompt "Admin login email" "${ADMIN_EMAIL:-mzozoyanaz@gmail.com}")
    ADMIN_PASSWORD=$(prompt_secret "Admin password (seeded into DB on startup)" "${ADMIN_PASSWORD:-Zola Mzozoyana 1970}")
    ADMIN_FIRST_NAME=$(prompt "Admin first name" "${ADMIN_FIRST_NAME:-Zola}")
    ADMIN_LAST_NAME=$(prompt "Admin last name" "${ADMIN_LAST_NAME:-Mzozoyana}")

    umask 177
    cat > "$ENV_FILE" <<EOF
# Hlumisa Properties — Docker environment
# Used by docker-compose.yml and setup-env-vars.sh. Keep this file secret.

# --- Twilio (WhatsApp + Messenger) ---
TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN
TWILIO_MESSAGING_SENDER_ID=$TWILIO_MESSAGING_SENDER_ID
TWILIO_WHATSAPP_FROM_NUMBER=$TWILIO_WHATSAPP_FROM_NUMBER

# --- Facebook ---
FACEBOOK_VERIFY_TOKEN=$FACEBOOK_VERIFY_TOKEN
FACEBOOK_PAGE_ACCESS_TOKEN=$FACEBOOK_PAGE_ACCESS_TOKEN
FACEBOOK_PAGE_ID=$FACEBOOK_PAGE_ID

# --- JWT ---
JWT_SECRET=$JWT_SECRET
JWT_ISSUER=$JWT_ISSUER
JWT_AUDIENCE=$JWT_AUDIENCE

# --- Admin user (seeded into the SQLite DB on API startup) ---
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
ADMIN_FIRST_NAME=$ADMIN_FIRST_NAME
ADMIN_LAST_NAME=$ADMIN_LAST_NAME

# --- Database (SQLite) ---
# Optional: docker-compose.yml already sets the SQLite connection string.
# CONNECTION_STRING=Data Source=/app/data/hlumisaproperties.db
EOF
    chmod 600 "$ENV_FILE"
    log ".env created at $ENV_FILE (permissions 600)."

    if grep -q "YOUR_" "$ENV_FILE"; then
        warn "Some values still contain placeholders (YOUR_...)."
        warn "Edit $ENV_FILE and replace them before going live with WhatsApp/Messenger."
    fi
fi

# ------------------------------------------------------------
# Step 3: Legacy MySQL check (informational only)
# ------------------------------------------------------------
log "Step 3: Checking for legacy MySQL containers..."
if $DC ps -a --format '{{.Names}} {{.Image}}' 2>/dev/null | grep -qi mysql; then
    warn "MySQL containers detected. They are no longer needed (the API now uses SQLite)."
    warn "Remove them with:  $DC down   then:  docker ps -a  /  docker rm <name>"
    warn "Do this only after exporting any data you still need."
else
    log "No legacy MySQL containers found."
fi
log "SQLite database: the API creates data/hlumisaproperties.db inside the"
log "'books-csv-data' Docker volume automatically on first start — nothing to configure."

# ------------------------------------------------------------
# Step 4: Build and start the API container
# ------------------------------------------------------------
log "Step 4: Building and starting the API container (this can take a few minutes)..."
$DC down --remove-orphans >/dev/null 2>&1 || true
$DC up -d --build
log "Container started."

# ------------------------------------------------------------
# Step 5: Wait for the API to become healthy
# deploy.sh already does an 8-attempt health check; here we wait longer
# because first start also runs EF migrations + seeding.
# ------------------------------------------------------------
log "Step 5: Waiting for the API to respond (migrations + seeding run on startup)..."
API_UP=0
for i in $(seq 1 60); do
    code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health 2>/dev/null || echo 000)
    if [ "$code" = "200" ]; then
        API_UP=1
        log "API is healthy! (attempt $i)"
        break
    fi
    printf "."
    sleep 2
done
echo ""
if [ "$API_UP" -ne 1 ]; then
    warn "API did not become healthy within 2 minutes. Recent logs:"
    $DC logs --tail 40 || true
    die "Setup finished with errors. Fix the issue above and re-run: bash setup.sh"
fi

# ------------------------------------------------------------
# Step 6: Verify the SQLite database + books.csv inside the volume
# ------------------------------------------------------------
log "Step 6: Verifying SQLite database files in the persistent volume..."
$DC exec -T hlumisa-api ls -la /app/data 2>/dev/null || warn "Could not list /app/data inside the container."
log "Startup log highlights:"
$DC logs 2>&1 | grep -Ei "Applying migration|Admin user|Seeded books|Database setup completed|error|fail" | tail -8 || true

# ------------------------------------------------------------
# Done
# ------------------------------------------------------------
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
echo ""
echo "========================================="
echo "  Setup complete!"
echo "========================================="
echo "  API:          http://localhost:5000"
if [ -n "${SERVER_IP:-}" ]; then
    echo "  Public:       http://$SERVER_IP:5000"
fi
echo "  Health:       http://localhost:5000/health"
echo ""
echo "  Useful commands:"
echo "    sudo docker compose logs -f                     # live logs"
echo "    sudo docker compose restart                     # restart API"
echo "    sudo ./deploy.sh                                # redeploy after git pull"
echo "    sudo docker compose exec hlumisa-api ls -la /app/data   # inspect SQLite files"
echo ""
echo "  SQLite backup (consistent, WAL-safe):"
echo "    sudo docker compose exec hlumisa-api sqlite3 /app/data/hlumisaproperties.db '.backup /app/data/backup.db'"
echo "========================================="