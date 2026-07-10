-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boards" (
    "id" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "backgroundType" TEXT NOT NULL DEFAULT 'color',
    "backgroundValue" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_work_cycles" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "completedColumnId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_work_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_columns" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_tags" (
    "cardId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_tags_pkey" PRIMARY KEY ("cardId","tagId")
);

-- CreateTable
CREATE TABLE "completed_work_cycles" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "completedColumnId" TEXT,
    "completedColumnTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "completed_work_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "completed_work_cycle_cards" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "originalCardId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "completed_work_cycle_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "completed_work_cycle_card_tags" (
    "id" TEXT NOT NULL,
    "archivedCardId" TEXT NOT NULL,
    "originalTagId" TEXT,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "completed_work_cycle_card_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_ownerId_sortOrder_idx" ON "projects"("ownerId", "sortOrder");

-- CreateIndex
CREATE INDEX "boards_ownerId_sortOrder_idx" ON "boards"("ownerId", "sortOrder");

-- CreateIndex
CREATE INDEX "boards_projectId_sortOrder_idx" ON "boards"("projectId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "board_work_cycles_boardId_key" ON "board_work_cycles"("boardId");

-- CreateIndex
CREATE INDEX "board_columns_boardId_sortOrder_idx" ON "board_columns"("boardId", "sortOrder");

-- CreateIndex
CREATE INDEX "cards_boardId_sortOrder_idx" ON "cards"("boardId", "sortOrder");

-- CreateIndex
CREATE INDEX "cards_columnId_sortOrder_idx" ON "cards"("columnId", "sortOrder");

-- CreateIndex
CREATE INDEX "tags_boardId_sortOrder_idx" ON "tags"("boardId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "tags_boardId_name_key" ON "tags"("boardId", "name");

-- CreateIndex
CREATE INDEX "card_tags_tagId_idx" ON "card_tags"("tagId");

-- CreateIndex
CREATE INDEX "completed_work_cycles_boardId_endDate_idx" ON "completed_work_cycles"("boardId", "endDate");

-- CreateIndex
CREATE INDEX "completed_work_cycle_cards_cycleId_sortOrder_idx" ON "completed_work_cycle_cards"("cycleId", "sortOrder");

-- CreateIndex
CREATE INDEX "completed_work_cycle_card_tags_archivedCardId_sortOrder_idx" ON "completed_work_cycle_card_tags"("archivedCardId", "sortOrder");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_work_cycles" ADD CONSTRAINT "board_work_cycles_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_columns" ADD CONSTRAINT "board_columns_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "board_columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completed_work_cycles" ADD CONSTRAINT "completed_work_cycles_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completed_work_cycle_cards" ADD CONSTRAINT "completed_work_cycle_cards_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "completed_work_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completed_work_cycle_card_tags" ADD CONSTRAINT "completed_work_cycle_card_tags_archivedCardId_fkey" FOREIGN KEY ("archivedCardId") REFERENCES "completed_work_cycle_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase Auth owns identity. Flowboard profiles are app-owned rows keyed by auth.users.id.
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_auth_users_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Public schema tables can be exposed through Supabase APIs. Keep RLS enabled even
-- though the Node API is the primary authorization boundary for this app.
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "boards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "board_work_cycles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "board_columns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "card_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "completed_work_cycles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "completed_work_cycle_cards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "completed_work_cycle_card_tags" ENABLE ROW LEVEL SECURITY;
