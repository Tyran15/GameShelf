-- Cada jogo passa a pertencer a um usuário.

-- 1) Coluna nullable, para poder preencher os jogos que já existem.
ALTER TABLE "Game" ADD COLUMN "userId" INTEGER;

-- 2) Jogos existentes ficam com o usuário mais antigo (menor id).
--    Para entregar a outro usuário depois: UPDATE "Game" SET "userId" = <id>;
UPDATE "Game" SET "userId" = (SELECT MIN("id") FROM "User") WHERE "userId" IS NULL;

-- 3) Agora a coluna pode ser obrigatória.
ALTER TABLE "Game" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Game_userId_idx" ON "Game"("userId");

-- AddForeignKey (apagar o usuário apaga os jogos dele)
ALTER TABLE "Game" ADD CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
