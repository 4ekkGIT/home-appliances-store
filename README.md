# home-appliances-store
Full-stack management system for a home appliances store.

## Local database

Copy `.env.example` to `.env`, replace both example passwords with unique local values, then start PostgreSQL:

```sh
cp .env.example .env
docker compose up -d --build
```

The frontend is available at `http://localhost:5173` and the backend at `http://localhost:8080`.
Locally sent verification emails are captured by Mailpit and can be viewed at `http://localhost:8025`; they are not delivered to real inboxes. The database and Mailpit ports are bound to localhost only. The `.env` file is git-ignored; do not commit real passwords or SMTP credentials.

For frontend development with live reload in Docker, start the stack with the development override:

```sh
docker compose -f compose.yaml -f compose.dev.yaml up -d --build
```

Edits under `frontend/` are reflected automatically in the browser; frontend source changes do not require rebuilding or restarting Docker. Use the same `-f` options when stopping the stack.

## Backend authentication

The backend uses database-backed authentication with server-side HTTP sessions. The browser receives an HttpOnly session cookie; mutating requests also require a CSRF token. Public registration creates `CUSTOMER` accounts; only `ADMIN` accounts can modify catalog data. Reads are public. Use HTTPS in any non-local deployment and set `SESSION_COOKIE_SECURE=true` so the session cookie is sent only over HTTPS.

Set `POSTGRES_PASSWORD`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the backend process environment. To create the initial administrator, provide both admin variables on the first startup; the bootstrap is idempotent and never resets an existing admin password. Keep the admin password private and do not leave it in shell history or committed files. If an account already exists at that email with a non-admin role, startup fails instead of granting it additional privileges.

The local Compose stack sends verification messages to Mailpit (`http://localhost:8025`). To deliver to real inboxes, configure `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SMTP_AUTH`, `MAIL_STARTTLS_ENABLE`, and a sender address accepted by your provider in `.env`, then recreate the backend with `docker compose up -d --force-recreate backend`. Keep SMTP credentials private. For a backend running outside Compose, set `MAIL_HOST` to `localhost` to use the locally exposed Mailpit SMTP port, or configure the real SMTP server directly.

The frontend obtains a CSRF token from `GET /api/auth/csrf`, registers with `POST /api/auth/register`, and signs in with `POST /api/auth/login` using the registered email and password. The session is maintained by the HttpOnly cookie; `GET /api/auth/me` returns the authenticated email and role. Sign out with the CSRF-protected `POST /api/auth/logout`.

For a local backend process, export the variables from `.env` before starting it (for example, `set -a; source .env; set +a` in Bash/Zsh). This also provides the one-time initial admin bootstrap values. Change the example credentials before use.

## Backend tests and API collection

Run integration tests with access to the local PostgreSQL database:

```sh
POSTGRES_PASSWORD='your-local-database-password' ./backend/mvnw -f backend/pom.xml test
```

Import `backend/postman/Nexora Catalog.postman_collection.json` into Postman. Configure collection/environment variables `baseUrl`, `username`, and `password` with the backend URL and administrator credentials. The collection signs in to establish a session and creates test catalog records, then removes them in its cleanup folder.

The `Backend checks` GitHub Actions workflow starts a disposable PostgreSQL service, runs Maven integration tests, starts the backend, and runs the same collection using Newman. Its credentials are test-only and must never be reused outside CI.

## Frontend catalog

The storefront loads products, categories, brands, product details, search results, filters, and sorting from the backend API. Start the backend, then run the frontend:

```sh
cp frontend/.env.example frontend/.env
npm --prefix frontend run dev
```

Set `VITE_API_BASE_URL` to the backend API root when it is not `http://localhost:8080/api`.
