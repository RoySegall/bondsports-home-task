CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"personId" integer,
	"balance" integer,
	"dailyWithdrawalLimit" integer,
	"activeFlag" boolean,
	"accountType" integer,
	"createdDate" date
);
--> statement-breakpoint
CREATE TABLE "persons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"document" text,
	"birthDate" date
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"accountId" integer,
	"value" integer NOT NULL,
	"transactionDate" date DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;