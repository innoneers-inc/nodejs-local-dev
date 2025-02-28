# nodejs-local-dev
2:> Reference: [Article on Medium](https://medium.com/your-article-link)

## Requirements

### 1.1 Node.js >= 20 & Yarn ~ 1.22
- Ensure Node.js version 20 or higher is installed.
- Yarn version 1.22 is required.

### 1.2 Google Cloud Project
- A Google Cloud Project (GCP) should be created.
- You must have access to the GCP project.

### 1.3 gcloud CLI
- The latest gcloud CLI tool should be installed.
- Ensure you are logged in with the proper Google account in gcloud.
- For local development, run:
  ```sh
  gcloud auth application-default login
  ```

## Local Development

### 2.1 Install dependencies
- `yarn`

### 2.2 Secrets Management

```shell
# Fetch secrets locally
yarn secrets:fetch {ENV}

# Run sync when new variable or secret file was introduced
yarn secrets:sync {ENV}
```

### 2.3 Setup environment

```shell
# Setup only frontend service
yarn setup:frontend {ENV}

# Setup only backend service
yarn setup:backend {ENV}

# Setup all at once
yarn setup {ENV}
```

### 2.4 Start

```shell
# Start frontend
yarn start:frontend

# Start backend
yarn start:backend
```

## Deployment

### 3.1 Fetch secrets & setup ENV

```shell
yarn secrets:fetch {ENV}
yarn setup {ENV}
```

### 3.2 Deploy

```shell
# Deploy frontend service only
yarn deploy:frontend {ENV}

# Deploy backend service only
yarn deploy:backend {ENV}

# Deploy dispatch rules only
yarn deploy:dispatch {ENV}

# Deploy all at once
yarn deploy {ENV}

```
