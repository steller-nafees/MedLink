# MedLink Backend Migration — Agent Rules

We are migrating the legacy MedLink backend into the new monorepo backend architecture.

## Legacy backend

The legacy backend is available through the `backend` git remote:

```text
https://github.com/TurabiRahman/Medlink-backend.git
```

Legacy structure:

```text
server/src/
├── config/
│   └── db.js
├── controllers/
├── middlewares/
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   └── validate.middleware.js
├── models/
├── routes/
├── services/
├── utils/
│   └── jwt.js
├── validations/
├── app.js
└── server.js
```

## New backend

The target backend is:

```text
apps/api/src/
├── infrastructure/
│   └── database/
│       └── postgres.js
├── modules/
│   ├── auth/
│   └── user/
├── shared/
│   └── utils/
│       └── jwt.js
├── app.js
└── server.js
```

## Migration architecture

Use this mapping:

```text
Legacy                         New
------------------------------------------------
config/db.js                -> infrastructure/database/
models/<x>.model.js         -> modules/<x>/<x>.repository.js
services/<x>.service.js     -> modules/<x>/<x>.service.js
controllers/<x>.controller  -> modules/<x>/<x>.controller.js
routes/<x>.routes.js        -> modules/<x>/<x>.routes.js
validations/<x>.validation  -> modules/<x>/<x>.validation.js
utils/jwt.js                -> shared/utils/jwt.js
middlewares/*               -> shared/middlewares/*
```

## Critical rules

1. Preserve existing API behavior unless there is a clear architectural reason not to.
2. Preserve endpoint paths, HTTP methods, request bodies, response shapes, status codes, validation behavior, authorization behavior, and database queries.
3. Do NOT rewrite business logic unnecessarily.
4. Do NOT introduce TypeScript.
5. Do NOT change the database schema.
6. Do NOT create duplicate implementations.
7. Before migrating a file, inspect the actual legacy file from the `backend` remote.
8. Do not guess missing legacy code.
9. Do not migrate multiple unrelated modules in one step.
10. After every migration step:

* run `node --check` on changed JavaScript files
* inspect `git diff`
* report exactly which files changed
* do not commit unless explicitly instructed.

11. Do not modify mobile/frontend files.
12. Do not modify unrelated backend modules.
13. If the legacy implementation depends on a file that has not yet been migrated, identify the dependency and stop rather than inventing a replacement.
14. Keep the migration incremental and reversible.
15. Do not delete legacy code outside the target migration area unless explicitly instructed.
16. Before changing an existing migrated file, show what is currently there and explain what will change.
17. Prefer small commits later, one migration unit at a time.

## Current migration status

The `auth` and `user` module foundations already exist in the new backend.

The current task is to progressively migrate the remaining legacy backend functionality into the new architecture.

Do not assume that a module is fully migrated merely because its directory exists. Compare it against the legacy implementation first.
