-- CreateTable
CREATE TABLE "EditorState" (
    "id" SERIAL NOT NULL,
    "meetingCode" TEXT NOT NULL,
    "yjsState" BYTEA NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditorState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EditorState_meetingCode_key" ON "EditorState"("meetingCode");
