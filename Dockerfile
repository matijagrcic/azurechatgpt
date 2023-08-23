FROM node:18.16.0-slim

LABEL maintainer "analytics@intellihr.com"
ENV REFRESHED_AT 2024-08-18

RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

WORKDIR /usr/src/app
