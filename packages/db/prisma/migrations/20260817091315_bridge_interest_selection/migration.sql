-- CreateTable
CREATE TABLE "_BridgeToPushSubscription" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BridgeToPushSubscription_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BridgeToPushSubscription_B_index" ON "_BridgeToPushSubscription"("B");

-- AddForeignKey
ALTER TABLE "_BridgeToPushSubscription" ADD CONSTRAINT "_BridgeToPushSubscription_A_fkey" FOREIGN KEY ("A") REFERENCES "bridge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BridgeToPushSubscription" ADD CONSTRAINT "_BridgeToPushSubscription_B_fkey" FOREIGN KEY ("B") REFERENCES "push_subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
