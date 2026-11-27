# Nexora Home Appliances Store

Full-stack showcase application for a home-appliances store. It demonstrates a React storefront, a Spring Boot REST API, PostgreSQL persistence, authentication, inventory reservation, customer orders, and an administrator workspace.

## Features

- Product catalog with categories, brands, search, filters, sorting, and product details.
- Customer registration, login, email verification, password recovery, and server-side sessions.
- Role-based access control for CUSTOMER and ADMIN accounts.
- Cart and checkout with cash on delivery (CASH_ON_DELIVERY).
- Order lifecycle: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, and CANCELLED.
- Stock-unit reservation during checkout and release when an order is cancelled.
- Customer order history at /orders and cancellation for pending/confirmed orders.
- Administrator catalog, warehouse, inventory, and order-status management.
- Idempotent checkout requests through the Idempotency-Key header.
- Flyway database migrations, integration tests, Docker Compose, and Mailpit.

The current payment mode is cash on delivery. Stripe and payment-provider webhooks are intentionally not required by the local setup.

## Stack

- Frontend: React, React Router, Vite, Tailwind CSS.
- Backend: Java, Spring Boot, Spring Security, Spring Data JPA, JDBC, Flyway.
- Database: PostgreSQL 17.
- Local infrastructure: Docker Compose and Mailpit.
- Tests: JUnit, Spring MockMvc, Maven.

## Quick start with Docker

Requirements:

- Docker Desktop with Compose v2.
- Node.js 20+ and npm only for frontend commands outside Docker.
- Java 21+ only for backend commands outside Docker.

Create the local environment file:

```powershell
Copy-Item .env.example .env
```

Edit .env and replace POSTGRES_PASSWORD, ADMIN_EMAIL, and ADMIN_PASSWORD with local values. Then start the full stack:

```powershell
docker compose up -d --build
```

Open:

- Storefront: http://localhost:5173
- Backend API: http://localhost:8080
- Mailpit inbox: http://localhost:8025
- PostgreSQL: localhost:5432, bound to localhost only

Check service status:

```powershell
docker compose ps
docker compose logs --tail=100 backend
```

Stop the stack without deleting data:

```powershell
docker compose down
```

Use `docker compose down -v` only when you intentionally want to remove local database and upload volumes.

## Frontend development with live reload

```powershell
docker compose -f compose.yaml -f compose.dev.yaml up -d --build
```

Stop the development stack:

```powershell
docker compose -f compose.yaml -f compose.dev.yaml down
```

Or run the frontend directly:

```powershell
Copy-Item frontend/.env.example frontend/.env
npm --prefix frontend ci
npm --prefix frontend run dev
```

For a direct Vite process, VITE_API_BASE_URL should normally be http://localhost:8080/api.

## Environment variables

The root .env file is used by Docker Compose. Start from [.env.example](./.env.example). Never commit .env, real passwords, SMTP credentials, or payment-provider secrets.

| Variable | Required | Purpose |
| --- | --- | --- |
| POSTGRES_PASSWORD | Yes | Password for the local PostgreSQL user nexora_user. |
| ADMIN_EMAIL | Yes | Initial administrator email. |
| ADMIN_PASSWORD | Yes | Initial administrator password; use at least 12 characters. |
| MAIL_HOST | No | SMTP host; defaults to Mailpit in Compose. |
| MAIL_PORT | No | SMTP port; defaults to 1025. |
| MAIL_USERNAME | No | SMTP username for real email delivery. |
| MAIL_PASSWORD | No | SMTP password for real email delivery. |
| MAIL_SMTP_AUTH | No | SMTP authentication flag; defaults to false. |
| MAIL_STARTTLS_ENABLE | No | SMTP STARTTLS flag; defaults to false. |
| MAIL_FROM | No | Sender address; defaults to no-reply@nexora.local. |
| EMAIL_VERIFICATION_BASE_URL | No | Frontend URL used in verification links. |
| EMAIL_VERIFICATION_TOKEN_VALIDITY_HOURS | No | Verification-token lifetime; defaults to 24. |
| SESSION_COOKIE_SECURE | No | Set to true only when serving the backend over HTTPS. |

The default local setup captures verification emails in Mailpit instead of delivering them. For real SMTP delivery, set the SMTP variables and recreate the backend:

```powershell
docker compose up -d --force-recreate backend
```

## Authentication and security

Authentication uses database-backed users and server-side HTTP sessions. The session cookie is HttpOnly. Mutating requests require a CSRF token obtained from GET /api/auth/csrf.

- Public users can browse the catalog and register.
- Customers can checkout, view their own orders, and cancel eligible orders.
- Administrators can manage catalog data, warehouses, inventory, and all orders.
- The initial admin is created from ADMIN_EMAIL and ADMIN_PASSWORD on first startup.
- Existing admin passwords are not reset on restart.
- Use HTTPS and set SESSION_COOKIE_SECURE=true outside local development.

## Order and checkout flow

1. A signed-in customer submits the cart to POST /api/orders.
2. The backend validates products and stock, creates a PENDING order, and reserves physical product units.
3. The response reports CASH_ON_DELIVERY; the UI shows “Order accepted”, not “Order confirmed”.
4. The browser sends an Idempotency-Key so retries return the original order instead of creating a duplicate.
5. The customer can view orders at /orders.
6. Cancelling a pending or confirmed order changes its status to CANCELLED and releases reserved units.
7. An administrator can move the order through the remaining lifecycle in the admin workspace.

Because the current mode is cash on delivery, there is no payment confirmation webhook in this setup. A card provider can be added later with a payment transaction table and idempotent webhook-event processing.

## Backend tests

The tests require access to the local PostgreSQL instance. With Docker running, load variables from .env without printing their values:

```powershell
$envFile = Join-Path (Get-Location).Path '.env'
Get-Content $envFile |
  Where-Object { $_ -match '^\s*[A-Za-z_][A-Za-z0-9_]*\s*=' -and $_ -notmatch '^\s*#' } |
  ForEach-Object {
    $parts = $_ -split '=', 2
    Set-Item -Path ("Env:" + $parts[0].Trim()) -Value $parts[1].Trim().Trim('"').Trim("'")
  }

.\backend\mvnw.cmd -f backend\pom.xml test
```

The suite covers authentication, catalog, inventory, email verification, order creation, stock reservation/release, customer order access, cancellation, and idempotent checkout.

## Frontend checks

```powershell
npm --prefix frontend run lint
npm --prefix frontend run build
```

## Project structure

```text
backend/
  src/main/java/             Spring Boot application, controllers, services, security
  src/main/resources/        application configuration and Flyway migrations
  src/test/java/              integration and service tests
frontend/
  src/api/                    API client
  src/pages/                  storefront, checkout, orders, and admin screens
  src/components/             shared UI components
compose.yaml                 local Docker stack
compose.dev.yaml             frontend live-reload override
.env.example                 safe local environment template
```

## API examples

Create an order with a retry-safe key:

```http
POST /api/orders
Idempotency-Key: checkout-unique-key
Content-Type: application/json
```

Customer order endpoints:

```text
GET  /api/orders/my
POST /api/orders/{id}/cancel
```

These endpoints require an authenticated customer session. State-changing requests also require the normal CSRF token.
