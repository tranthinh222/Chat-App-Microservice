-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_recipient_id_created_at_idx" ON "notifications"("recipient_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_event_id_idx" ON "notifications"("event_id");
