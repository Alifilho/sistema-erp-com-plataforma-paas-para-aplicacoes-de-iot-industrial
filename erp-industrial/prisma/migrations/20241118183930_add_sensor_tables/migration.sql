/*
  Warnings:

  - You are about to drop the `SensorData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SensorData";

-- CreateTable
CREATE TABLE "HydraulicPressData" (
    "id" SERIAL NOT NULL,
    "machineId" TEXT NOT NULL,
    "pressure" DOUBLE PRECISION NOT NULL,
    "oilTemperature" DOUBLE PRECISION NOT NULL,
    "operationTime" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HydraulicPressData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LatheMachineData" (
    "id" SERIAL NOT NULL,
    "machineId" TEXT NOT NULL,
    "rpm" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "vibration" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LatheMachineData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConveyorBeltData" (
    "id" SERIAL NOT NULL,
    "machineId" TEXT NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "load" DOUBLE PRECISION NOT NULL,
    "motorTemperature" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConveyorBeltData_pkey" PRIMARY KEY ("id")
);
