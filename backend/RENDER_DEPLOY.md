# Deploy Libranet on Render

## 1) Push your latest code
Make sure the following files are in your repository:
- `render.yaml`
- `backend/Dockerfile`
- `backend/.dockerignore`

## 2) Create services from Blueprint
1. In Render, click **New** -> **Blueprint**.
2. Connect your GitHub repository.
3. Select the branch with these changes.
4. Render will detect `render.yaml` and create:
	- `libranet-frontend` (static site)
	- `libranet-backend` (Docker web service)

## 3) Set required environment variables in Render
Set these on the `libranet-backend` service:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_JWT_SECRET`

`APP_CORS_ALLOWED_ORIGINS` is already set in the blueprint to:
- `https://libranet-frontend.onrender.com`

Frontend API URL is auto-resolved at runtime for Render domains.
If needed, you can still set `VITE_API_URL` manually on `libranet-frontend`.

## 4) Database note
This backend is configured for MySQL (`com.mysql.cj.jdbc.Driver`).
Use a MySQL database provider and pass its JDBC URL in `SPRING_DATASOURCE_URL`.

## 5) Confirm successful deploy
After deploy, test:
- `GET /actuator/health`
- `GET /api/resources`
- `POST /api/auth/login`

If deploy fails, open Render logs and verify DB credentials and network access from Render to your MySQL host.
