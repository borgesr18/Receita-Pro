/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `ingredient_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,userId]` on the table `measurement_units` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[abbreviation,userId]` on the table `measurement_units` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId,channelId,userId]` on the table `product_prices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,userId]` on the table `recipe_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,userId]` on the table `sales_channels` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,userId]` on the table `suppliers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `ingredient_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ingredients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `measurement_units` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `product_prices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `recipe_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `recipes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `sales_channels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `suppliers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ingredient_categories_name_key";

-- DropIndex
DROP INDEX "measurement_units_abbreviation_key";

-- DropIndex
DROP INDEX "measurement_units_name_key";

-- DropIndex
DROP INDEX "product_prices_productId_channelId_key";

-- DropIndex
DROP INDEX "recipe_categories_name_key";

-- DropIndex
DROP INDEX "sales_channels_name_key";

-- DropIndex
DROP INDEX "suppliers_name_key";

-- AlterTable
ALTER TABLE "ingredient_categories" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ingredients" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "measurement_units" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product_prices" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "recipe_categories" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sales_channels" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "preco_calculado" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "custo" DOUBLE PRECISION NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "lucro" DOUBLE PRECISION NOT NULL,
    "precoFinal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preco_calculado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ingredient_categories_name_userId_key" ON "ingredient_categories"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "measurement_units_name_userId_key" ON "measurement_units"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "measurement_units_abbreviation_userId_key" ON "measurement_units"("abbreviation", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "product_prices_productId_channelId_userId_key" ON "product_prices"("productId", "channelId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_categories_name_userId_key" ON "recipe_categories"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "sales_channels_name_userId_key" ON "sales_channels"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_name_userId_key" ON "suppliers"("name", "userId");

-- AddForeignKey
ALTER TABLE "recipe_categories" ADD CONSTRAINT "recipe_categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_categories" ADD CONSTRAINT "ingredient_categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement_units" ADD CONSTRAINT "measurement_units_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_channels" ADD CONSTRAINT "sales_channels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preco_calculado" ADD CONSTRAINT "preco_calculado_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
