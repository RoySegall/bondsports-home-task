import {accountTable, personsTable} from "../schema.ts";
import {db} from "../index.ts";
import {eq} from "drizzle-orm";

type Person = typeof personsTable.$inferInsert
type Account = typeof accountTable.$inferInsert;

export async function createAccount(account: Account) {
    if (!account.personId) {
        throw new Error("Missing person ID");
    }

    const person = await db.select()
        .from(personsTable)
        .where(eq(personsTable.id, account.personId))

    if (!person.length) {
        throw new Error('No such person');
    }

    return db.insert(accountTable).values(account).returning();
}

export async function depositAccount({}: { account: Account, amount: number }) {
}

export async function checkBalance(account: Account) {
    console.log(account);
}

export async function withdrawAccount({}: { account: Account, amount: number }) {
}

export async function blockAccount(account: Account) {
    console.log(account);
}

export async function getAccountTransactions(account: Account) {
    console.log(account);
}
