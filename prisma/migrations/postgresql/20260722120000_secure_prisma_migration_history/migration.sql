-- Keep Prisma's internal migration ledger inaccessible through Supabase's
-- exposed public schema. Prisma migrations use the direct database connection
-- as the table owner, which is unaffected by this policy.
ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."_prisma_migrations"
FROM PUBLIC, anon, authenticated;
