import {pgTable, text, date, integer, boolean, serial, timestamp} from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';


// Tables.
export const personsTable = pgTable("persons", {
    id: serial("id").primaryKey(),
    name: text().notNull(),
    document: text(),
    birthDate: date(),
});

export const accountTable = pgTable("accounts", {
    id: serial("id").primaryKey(),
    personId: integer(),
    balance: integer(),
    dailyWithdrawalLimit: integer(),
    activeFlag: boolean(),
    accountType: integer(),
    createdDate: date(),
});

export const transactionTable = pgTable("transactions", {
    id: serial("id").primaryKey(),
    accountId: integer().references(() => accountTable.id, {onDelete: "cascade"}),
    value: integer().notNull(),
    transactionDate: timestamp("transactionDate", { withTimezone: true, mode: 'date' }).defaultNow(),
});

// Relations.
export const personRelations = relations(personsTable, ({many}) => ({
    account: many(accountTable)
}));

export const accountRelations = relations(accountTable, ({one, many}) => ({
    person: one(personsTable, {
        fields: [accountTable.personId],
        references: [personsTable.id],
    }),
    transactions: many(transactionTable)
}));

export const transactionRelations = relations(transactionTable, ({ one }) => ({
    account: one(accountTable, {
        fields: [transactionTable.accountId],
        references: [accountTable.id],
    }),
}));