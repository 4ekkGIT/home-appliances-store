# home-appliances-store
Full-stack management system for a home appliances store.

## Local database

Copy `.env.example` to `.env`, replace the password with a strong local value, then start PostgreSQL:

```sh
docker compose up -d
```

The database port is bound to localhost only. Set `POSTGRES_PASSWORD` in your environment when running the backend outside Docker.
