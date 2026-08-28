# Cloudflare and GitHub setup

The repository contains the storefront, catalog manager, D1 migrations, and R2 upload integration. Secrets and uploaded artwork stay outside GitHub.

## Cloudflare resources

1. Create a D1 database named `avoocado-catalog`.
2. Replace the placeholder `database_id` in `wrangler.jsonc` with its real ID.
3. Create an R2 bucket named `avoocado-artworks`.
4. Apply the migrations in `db/migrations` to the D1 database.
5. Add encrypted Worker secrets named `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.

## GitHub deployment

Connect the GitHub repository in Cloudflare Workers Builds. Use `npm run build:vinext` as the build command and `npm run deploy:vinext` as the deploy command if Cloudflare does not detect them automatically.

Never commit `.dev.vars`, `.env`, Cloudflare API tokens, the admin password, or the session secret. `.dev.vars.example` documents names only.

## Local development

Copy `.dev.vars.example` to `.dev.vars`, replace both example values, apply migrations to the local D1 database, and run the vinext development command.
