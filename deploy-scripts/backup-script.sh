#!/bin/bash

BACKUP_DIR="/var/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Starting backup at $DATE"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup database
if [ -f /var/app/data/database.sqlite ]; then
    echo "Backing up database..."
    cp /var/app/data/database.sqlite $BACKUP_DIR/database_$DATE.sqlite
    echo "Database backed up: database_$DATE.sqlite"
fi

# Backup uploads directory
if [ -d /var/app/uploads ]; then
    echo "Backing up uploads..."
    tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /var/app uploads
    echo "Uploads backed up: uploads_$DATE.tar.gz"
fi

# Keep only last 7 days of backups
echo "Cleaning old backups..."
find $BACKUP_DIR -name "database_*.sqlite" -mtime +7 -delete
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +7 -delete

# Show backup size
BACKUP_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
echo "Total backup size: $BACKUP_SIZE"

echo "Backup completed successfully!"
