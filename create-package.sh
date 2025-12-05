#!/bin/bash
cd backend
if [ -f package-lock.json ]; then
    tar -czf ../deploy-package.tar.gz src package.json package-lock.json .env.production 2>/dev/null || tar -czf ../deploy-package.tar.gz src package.json package-lock.json
else
    tar -czf ../deploy-package.tar.gz src package.json .env.production 2>/dev/null || tar -czf ../deploy-package.tar.gz src package.json
fi
