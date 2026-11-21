# home-appliances-store
Full-stack management system for a home appliances store.

## Local database

Copy `.env.example` to `.env`, replace both example passwords with unique local values, then start PostgreSQL:

```sh
cp .env.example .env
docker compose up -d
```

The database port is bound to localhost only. The `.env` file is git-ignored; do not commit real passwords.

## Backend authentication

The backend uses database-backed HTTP Basic authentication. Public registration creates `CUSTOMER` accounts; only `ADMIN` accounts can modify catalog data. Reads are public. Use HTTPS in any non-local deployment because Basic credentials are sent with every request.

Set `POSTGRES_PASSWORD`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the backend process environment. To create the initial administrator, provide both admin variables on the first startup; the bootstrap is idempotent and never resets an existing admin password. Keep the admin password private and do not leave it in shell history or committed files. If an account already exists at that email with a non-admin role, startup fails instead of granting it additional privileges.

Register a customer with `POST /api/auth/register`, then authenticate with the registered email and password. `GET /api/auth/me` returns the authenticated email and role.

For a local backend process, export the variables from `.env` before starting it (for example, `set -a; source .env; set +a` in Bash/Zsh). This also provides the one-time initial admin bootstrap values. Change the example credentials before use.

## Backend tests and API collection

Run integration tests with access to the local PostgreSQL database:

```sh
POSTGRES_PASSWORD='your-local-database-password' ./backend/mvnw -f backend/pom.xml test
```

Import `backend/postman/Nexora Catalog.postman_collection.json` into Postman. Configure collection/environment variables `baseUrl`, `username`, and `password` with the backend URL and administrator credentials. The collection creates test catalog records and removes them in its cleanup folder.

The `Backend checks` GitHub Actions workflow starts a disposable PostgreSQL service, runs Maven integration tests, starts the backend, and runs the same collection using Newman. Its credentials are test-only and must never be reused outside CI.
