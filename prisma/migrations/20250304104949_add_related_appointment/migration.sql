-- CreateTable
CREATE TABLE "appointments" (
    "id" SERIAL NOT NULL,
    "order_detail_id" INTEGER NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "scheduled_time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "customer_note" TEXT,
    "employee_note" TEXT,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointments_order_detail_id_key" ON "appointments"("order_detail_id");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_order_detail_id_fkey" FOREIGN KEY ("order_detail_id") REFERENCES "service_order_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
