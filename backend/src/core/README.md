# Core Infrastructure

This directory contains the core framework code for the scalable architecture refactor.

## Directory Structure

### `/container/`
Dependency Injection container implementation. Manages service instantiation and dependency resolution.

### `/database/`
PostgreSQL database abstraction layer with connection pooling. Provides a clean interface for database operations supporting both local PostgreSQL and AWS RDS.

### `/errors/`
Custom error classes for consistent error handling across the application. Includes:
- ApplicationError (base class)
- ValidationError
- NotFoundError
- UnauthorizedError
- ForbiddenError
- ConflictError
- DatabaseError

### `/logger/`
Logging utilities and configuration using Winston. Provides structured logging with correlation IDs and environment-specific log levels.

### `/config/`
Configuration management with environment variable loading and validation. Supports both local and AWS deployment configurations.

## Usage

These core components are used by all feature modules in `/modules/` and provide the foundation for the new architecture.
