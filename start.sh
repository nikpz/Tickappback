#!/usr/bin/env bash
set -e
if [ ! -f .env ]; then
  echo 'Please copy .env.example to .env and configure DATABASE_URL and JWT_SECRET.'
  exit 1
fi
npm install
node server.js
