-- CreateTable
CREATE TABLE "push_subscription_mute" (
    "id" TEXT NOT NULL,
    "pushSubscriptionId" TEXT NOT NULL,
    "bridgeId" TEXT NOT NULL,
    "mutedUntil" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscription_mute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_subscription_mute_pushSubscriptionId_bridgeId_key" ON "push_subscription_mute"("pushSubscriptionId", "bridgeId");

-- AddForeignKey
ALTER TABLE "push_subscription_mute" ADD CONSTRAINT "push_subscription_mute_pushSubscriptionId_fkey" FOREIGN KEY ("pushSubscriptionId") REFERENCES "push_subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscription_mute" ADD CONSTRAINT "push_subscription_mute_bridgeId_fkey" FOREIGN KEY ("bridgeId") REFERENCES "bridge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
