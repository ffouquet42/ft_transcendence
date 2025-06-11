#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CORE_DIR="$(dirname "$SCRIPT_DIR")"
SRCS_DIR="$CORE_DIR/srcs"

# Create temporary certs directory
TEMP_CERTS_DIR="$SCRIPT_DIR/temp_certs"
mkdir -p "$TEMP_CERTS_DIR"

# Generate private key and certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$TEMP_CERTS_DIR/key.pem" \
    -out "$TEMP_CERTS_DIR/cert.pem" \
    -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=localhost"

# Set proper permissions
chmod 600 "$TEMP_CERTS_DIR/key.pem"
chmod 644 "$TEMP_CERTS_DIR/cert.pem"

# Create certs directories in front and back if they don't exist
mkdir -p "$SRCS_DIR/front/certs"
mkdir -p "$SRCS_DIR/back/certs"

# Copy certificates to front and back directories
cp "$TEMP_CERTS_DIR/key.pem" "$SRCS_DIR/front/certs/"
cp "$TEMP_CERTS_DIR/cert.pem" "$SRCS_DIR/front/certs/"
cp "$TEMP_CERTS_DIR/key.pem" "$SRCS_DIR/back/certs/"
cp "$TEMP_CERTS_DIR/cert.pem" "$SRCS_DIR/back/certs/"

# Set proper permissions in the destination directories
chmod 600 "$SRCS_DIR/back/certs/key.pem"
chmod 644 "$SRCS_DIR/back/certs/cert.pem"
chmod 600 "$SRCS_DIR/front/certs/key.pem"
chmod 644 "$SRCS_DIR/front/certs/cert.pem"

# Remove the temporary certs directory
rm -rf "$TEMP_CERTS_DIR"

echo "SSL certificates have been generated and copied to front and back directories" 