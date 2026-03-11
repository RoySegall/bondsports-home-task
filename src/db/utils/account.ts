import {accountTable, personsTable} from "../schema.ts";
import {db} from "../index.ts";
import {eq} from "drizzle-orm";

type Person = typeof personsTable.$inferInsert
type Account = Omit<typeof accountTable.$inferInsert, "id" | "personId"> & { person: Person };

export async function createAccount(account: Account) {
    const person = await db.select()
        .from(personsTable)
        .where(eq(personsTable.id, account.person.id))

    if (!person.length) {
        throw new Error('No such person');
    }

    const personForAccount = await db.select().from(personsTable).where(eq(personsTable.id, account.person.id));

    if (personForAccount.length) {
        throw new Error('Cannot create an acocunt for a person with an existing accout');
    }
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
