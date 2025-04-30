-- Create extensions
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- CreateTable
CREATE TABLE "active_device" (
    "device_id" VARCHAR(255) NOT NULL,
    "usage_record_id" BIGINT NOT NULL,

    CONSTRAINT "active_device_pkey" PRIMARY KEY ("device_id")
);

-- CreateTable
CREATE TABLE "device" (
    "id" VARCHAR(255) NOT NULL,
    "mac_address" VARCHAR(17) NOT NULL,
    "ip_address" INET NOT NULL,
    "alias" VARCHAR(60) NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "previous_aliases" VARCHAR(60)[],

    CONSTRAINT "device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage" (
    "id" BIGSERIAL NOT NULL,
    "user_email" CITEXT NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimated_use_time" TIMESTAMPTZ(6),
    "consumption" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "charge" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "device_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "usage_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "check_end_date_after_start_date" CHECK (end_date >= start_date)
);

-- CreateIndex
CREATE UNIQUE INDEX "active_device_usage_record_id_key" ON "active_device"("usage_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_mac_address_key" ON "device"("mac_address");

-- CreateIndex
CREATE UNIQUE INDEX "device_ip_address_key" ON "device"("ip_address");

-- CreateIndex
CREATE UNIQUE INDEX "device_alias_key" ON "device"("alias");

-- Create GiST index for user email + timerange queries
CREATE INDEX "idx_usage_user_timerange" ON "usage" 
USING GIST (user_email, tstzrange(start_date, end_date));

-- AddForeignKey
ALTER TABLE "active_device" ADD CONSTRAINT "fk_active_device_device" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "active_device" ADD CONSTRAINT "fk_active_device_usage" FOREIGN KEY ("usage_record_id") REFERENCES "usage"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usage" ADD CONSTRAINT "fk_usage_device" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
