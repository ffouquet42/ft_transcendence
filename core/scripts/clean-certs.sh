#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CORE_DIR="$(dirname "$SCRIPT_DIR")"
SRCS_DIR="$CORE_DIR/srcs"

# Remove certs directories from front and back
rm -rf "$SRCS_DIR/front/certs"
rm -rf "$SRCS_DIR/back/certs"

echo "Certificate directories have been cleaned" 