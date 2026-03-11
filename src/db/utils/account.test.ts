import {describe, it, beforeAll, beforeEach, expect} from 'vitest';
import {db, setTestDb} from "../index.ts";
import {personsTable, transactionTable, accountTable} from '../schema.ts';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import {createAccount} from "./account.ts";
import {eq} from "drizzle-orm";

describe("Account", () => {

    beforeAll(async () => {
        setTestDb("postgresql://user:password@localhost:5433/bond_sports_testing");
        await migrate(db, { migrationsFolder: './drizzle' });
    });

    beforeEach(async () => {
        // todo: go over all the tables, smarter, and clean them.
        await Promise.all([personsTable, transactionTable,accountTable].map(table => db.delete(table)))
    });

    describe("createAccount", () => {
        it("should not create a new account for a non-existing person", async () => {
            await expect(createAccount({
                personId: 100,
                accountType: 42,
                balance: 0,
                activeFlag: true,
                createdDate: new Date().toDateString(),
                dailyWithdrawalLimit: 1000,
            })).rejects.toThrow('No such person')
        });
        it("should create a new account for existing person", async () => {
            const [person] = await db.insert(personsTable).values({
                name: "John doe",
                document: "1234567890",
                birthDate: new Date().toDateString(),
            }).returning({ insertedId: personsTable.id });

            const [createdAccount] = await createAccount({
                personId: person.insertedId,
                accountType: 42,
                balance: 0,
                activeFlag: true,
                createdDate: new Date().toDateString(),
                dailyWithdrawalLimit: 1000,
            });

            const [accountFromDb] = await db.select().from(accountTable).where(eq(accountTable.id, createdAccount.id));
            expect(createdAccount.id).toBe(accountFromDb.id)
        });
        it("should create multiple accounts for person", () => {});
    });

    describe("depositAccount", () => {
        it("should not deposit to non-existing account", () => {});
        it("should not deposit to blocked account", () => {});
        it("should deposit a non-blocked account", () => {});
    });

    describe("checkBalance", () => {
        it("should not return balance for non-existing account", () => {});
        it("should not return balance for blocked account", () => {});
        it("should return balance for existing account", () => {});
    });

    describe("withdrawAccount", () => {
        it("should not withdraw a account for a non-existing account", () => {});
        it("should not withdraw a account for a blocked account", () => {});
        it("should not withdraw money if the account exceeded the daily limit", () => {});
        it("should withdraw money for active account which did not exceed the daily limit", () => {});
    });

    describe("blockAccount", () => {
        it("should not block a non-existing account", () => {});
        it("should block an account and not affect other accounts", () => {});
    });

    describe("getAccountTransactions", () => {
        it("should not show the transactions for non-existing account", () => {});
        it("should not show the transaction for a blocked account", () => {});
        it("should show the transactions for existing account", () => {});
    });
});
