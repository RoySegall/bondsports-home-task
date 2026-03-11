import type {accountTable, personsTable} from "../schema.ts";

type Person = typeof personsTable.$inferInsert
type Account = Omit<typeof accountTable.$inferInsert, "id" | "personId"> & {person: Person};

export async function createAccount(account: Account) {
    console.log(account);
}

export async function depositAccount({}: {account: Account, amount: number}) {}

export async function checkBalance(account: Account) {
    console.log(account);
}

export async function blockAccount(account: Account) {
    console.log(account);
}

export async function getAccountTransactions(account: Account) {
    console.log(account);
}
