# ECS Deployment Guide

This document outlines the architecture, prerequisites, and steps to deploy the Digimart Cedar application to AWS ECS using Fargate.

## Architecture

The application consists of three main components running in an ECS Task:
1. **Database (PostgreSQL):** Managed container for data persistence.
2. **Backend (Django):** Python API server handling business logic.
3. **Frontend (Nginx):** Serves the compiled Svelte frontend.

## Prerequisites

- AWS CLI configured
- Docker installed locally
- ECR repositories created

## Deployment Steps

1. **Build and Push:** Run `./build-and-push-ecs.sh`.
2. **Register Task:** Run `aws ecs register-task-definition --cli-input-json file://ecs-task-prod.json`.
3. **Create Service:** Run the `aws ecs create-service` command.

## Build and Push

The script builds backend and frontend images and pushes them to ECR.

## Register Task

Registers the task definition defined in `ecs-task-prod.json`.

## Troubleshooting

- **Health Checks:** Check CloudWatch logs for migration errors.
- **Permissions:** Verify IAM roles for ECS.

## Monitoring

- Use CloudWatch Logs for container output.
- Monitor CPU/Memory in the ECS Console.