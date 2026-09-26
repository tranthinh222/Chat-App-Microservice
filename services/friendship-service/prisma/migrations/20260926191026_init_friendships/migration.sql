-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateTable
CREATE TABLE "friendships" (
    "id" SERIAL NOT NULL,
    "user_low_id" INTEGER NOT NULL,
    "user_high_id" INTEGER NOT NULL,
    "requested_by_id" INTEGER NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "friendships_user_low_id_status_idx" ON "friendships"("user_low_id", "status");

-- CreateIndex
CREATE INDEX "friendships_user_high_id_status_idx" ON "friendships"("user_high_id", "status");

-- CreateIndex
CREATE INDEX "friendships_requested_by_id_status_idx" ON "friendships"("requested_by_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_user_low_id_user_high_id_key" ON "friendships"("user_low_id", "user_high_id");
