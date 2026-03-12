ALTER TABLE "transactions" ALTER COLUMN "transactionDate" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "transactionDate" SET DEFAULT now();