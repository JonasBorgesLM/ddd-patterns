# ddd-patterns

**The tactical building blocks of Domain-Driven Design, implemented in
TypeScript and held in place by tests** — entities, value objects, aggregates,
repositories, factories, domain events and the notification pattern, with a thin
Express layer on top to show the domain surviving contact with the outside
world.

## Why this project

DDD's tactical patterns are easy to name and hard to feel. The distinction
between an entity and a value object is one sentence long and takes a real
codebase to internalize; the reason an aggregate has exactly one root only
becomes obvious once something tries to mutate its interior from outside.

So the point here is not the domain — it is a small store: customers, products,
orders. The point is that every pattern is implemented against a case where it
does something, and each one is pinned by a test that fails if the property
stops holding.

## The patterns, and where they live

| Pattern | Where | What it actually demonstrates |
| --- | --- | --- |
| **Entity** | `domain/@shared/entity/entity.abstract.ts` | Identity that survives a change of every attribute |
| **Value object** | `domain/customer/value-object/address.ts` | No identity, validated on construction, replaced rather than mutated |
| **Aggregate** | `domain/checkout/entity/order.ts` | `Order` owns `OrderItem`; the total is recomputed from the items on every mutation, never accepted from outside |
| **Repository** | `domain/@shared/repository/repository-interface.ts` | One interface per aggregate, in the domain — implementations outside it |
| **Factory** | `domain/*/factory/` | Construction rules kept out of the constructor |
| **Domain event** | `domain/@shared/event/` | A dispatcher, typed events, and multiple handlers per event |
| **Notification** | `domain/@shared/notification/` | Accumulated validation errors, so one call reports every problem |
| **Validator** | `domain/*/validator/` | Yup at the edge of the domain, behind a domain-owned interface |

The dependency rule is the thing to check while reading: `src/domain` imports
nothing from `src/infrastructure` or `src/usecase`. Persistence, HTTP and
serialization all point inward. If that ever reverses, the patterns above stop
buying anything.

## Layout

```
src/
├── domain/           # entities, value objects, events, repository interfaces
├── usecase/          # one folder per use case: dto, usecase, unit + integration specs
└── infrastructure/   # Sequelize repositories, Express routes, presenters
```

Use cases are organized by operation rather than by layer — `usecase/customer/create/`
holds its DTO, its implementation and both its unit and integration specs. The
unit spec runs against a mocked repository; the integration spec runs against a
real SQLite database.

## Running it

Requires Node 22.

```bash
npm install
npm run dev          # http://localhost:3000
```

Persistence is Sequelize over an **in-memory SQLite** database, created and
synced on boot — nothing to install, and every restart is a clean slate. Set
`STORAGE` in `.env` to persist to disk instead; see `.env.example`.

### Tests

```bash
npm test             # typechecks with tsc --noEmit, then runs Jest
```

The suite covers the domain units, the use cases at both unit and integration
level, and the API end to end (`src/infrastructure/api/__tests__/`).

## API

| Method | Route | Notes |
| --- | --- | --- |
| `POST` | `/customer` | Creates a customer with a nested address |
| `GET` | `/customer` | Content-negotiated: JSON by default, **XML** via `Accept: application/xml` |
| `POST` | `/product` | Creates a product |
| `GET` | `/product` | Lists products |

The XML representation on `GET /customer` is deliberate: it is the presenter
pattern earning its place. The use case returns one output DTO, and two
presenters render it two ways, so the domain never learns what a response looks
like.

```bash
curl -X POST http://localhost:3000/customer \
  -H 'Content-Type: application/json' \
  -d '{"name":"Jonas","address":{"street":"Rua A","number":123,"zip":"00000-000","city":"São Paulo"}}'

curl http://localhost:3000/customer -H 'Accept: application/xml'
```

## Scope

This is a study repository. The functional surface is intentionally thin — there
is no authentication, no pagination and no real order endpoint — because adding
them would grow the code without demonstrating another pattern.
