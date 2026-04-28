# Deploy Libranet on Railway

## 1) Upload the project
Connect this repository to Railway and deploy the `backend` folder as the service root.

Use the existing Dockerfile at `backend/Dockerfile`.

## 2) Set environment variables
Set these variables on the backend service:

- `SPRING_PROFILES_ACTIVE=prod`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_JWT_SECRET`
- `APP_CORS_ALLOWED_ORIGINS`

If Railway gives you a raw MySQL URL such as `mysql://user:password@host:3306/database`, you can paste that into `SPRING_DATASOURCE_URL` directly. The backend now normalizes it to the JDBC format that Spring Boot expects.

## 3) Recommended Railway values

- `SPRING_DATASOURCE_URL`: the Railway MySQL connection string
- `SPRING_DATASOURCE_USERNAME`: the Railway database username
- `SPRING_DATASOURCE_PASSWORD`: the Railway database password
- `APP_CORS_ALLOWED_ORIGINS`: your frontend URL, for example `https://your-frontend.up.railway.app`

## 4) Confirm deployment
After deploy, verify:

- `GET /actuator/health`
- `GET /api/resources`
- `POST /api/auth/login`

If the app cannot reach MySQL, check the Railway service variables and make sure the database host is reachable from the backend service.