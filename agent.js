import readline from 'node:readline/promises';
import db_connection from './db_connection.js';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Main function to process user query from frontend
 */
export async function callAgent(question) {
    let messages = [
        {
            role: 'system',
            content: `You are Josh, a personal finance assistant. Your task is to assist the user with their expenses, balances, and financial planning.
            You have access to the following tools:
            1. getTotalExpense({from, to}): string // Get total expense for a time period.
            2. addExpense({name, amount}): string // Add new expense to the expense database.
            3. addIncome({name, amount}): string // Add new income to income database.
            3. getMoneyBalance(): string // Get remaining money balance from database.
            `,
        },
    ];

  
    messages.push({
        role: 'user',
        content: question,
    });

    try {
        // Create a request to the Groq API / agent calling 
        const completion = await groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.3-70b-versatile',
            tools: [
                {
                    type: 'function',
                    function: {
                        name: 'getTotalExpense',
                        description: 'Get total expense from date to date.',
                        parameters: {
                            type: 'object',
                            properties: {
                                from: {
                                    type: 'string',
                                    description: 'From date to get the expense.',
                                },
                                to: {
                                    type: 'string',
                                    description: 'To date to get the expense.',
                                },
                            },
                        },
                    },
                },
                {
                    type: 'function',
                    function: {
                        name: 'addExpense',
                        description: 'Add new expense entry to the expense database.',
                        parameters: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description: 'Name of the expense. e.g., Bought an iphone',
                                },
                                amount: {
                                    type: 'string',
                                    description: 'Amount of the expense.',
                                },
                            },
                        },
                    },
                },
                {
                    type: 'function',
                    function: {
                        name: 'addIncome',
                        description: 'Add new income entry to income database',
                        parameters: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description: 'Name of the income. e.g., Got salary',
                                },
                                amount: {
                                    type: 'string',
                                    description: 'Amount of the income.',
                                },
                            },
                        },
                    },
                },
                {
                    type: 'function',
                    function: {
                        name: 'getMoneyBalance',
                        description: 'Get remaining money balance from database.',
                    },
                },
            ],
        });

        messages.push(completion.choices[0].message);

        const toolCalls = completion.choices[0].message.tool_calls;
        if (!toolCalls) {
            return completion.choices[0].message.content;
        }

        for (const tool of toolCalls) {
            const functionName = tool.function.name;
            const functionArgs = tool.function.arguments;

            let result = '';
            if (functionName === 'getTotalExpense') {
                result = await getTotalExpense(JSON.parse(functionArgs)); // <-- Get total expenses
            } else if (functionName === 'addExpense') {
                result = await addExpense(JSON.parse(functionArgs)); // <-- Add new expense
            } else if (functionName === 'addIncome') {
                result = await addIncome(JSON.parse(functionArgs)); // <-- Add new income
            } else if (functionName === 'getMoneyBalance') {
                result = await getMoneyBalance(JSON.parse(functionArgs)); // <-- Get current balance
            }

            messages.push({
                role: 'tool',
                content: result,
                tool_call_id: tool.id,
            });
        }

        // Return the final response message to the frontend (based on the latest message)
        return messages[messages.length - 1].content;  
    } catch (err) {
        console.error("Error encountered:", err);
        return 'Sorry, I encountered an error while processing your request.';
    }
}

/**
 * Get total expense for a given time period
 */
async function getTotalExpense({ from, to }) {
    try {
        const [results] = await db_connection.execute(
            'SELECT SUM(amount) AS totalExpense FROM Expenses WHERE date BETWEEN ? AND ?',
            [from, to]
        );
        return `${results[0].totalExpense} INR`;
    } catch (err) {
        console.error('Error fetching total expense:', err);
        throw err;
    }
}

/**
 * Add new expense to the database
 */
async function addExpense({ name, amount }) {
    try {
        await db_connection.execute(
            'INSERT INTO Expenses (name, amount) VALUES (?, ?)',
            [name, amount]
        );
        return 'Expense added to the database.';
    } catch (err) {
        console.error('Error adding expense:', err);
        throw err; 
    }
}

/**
 * Add new income to the database
 */
async function addIncome({ name, amount }) {
    try {
        await db_connection.execute(
            'INSERT INTO Incomes (name, amount) VALUES (?, ?)',
            [name, amount]
        );
        return 'Income added to the database.';
    } catch (err) {
        console.error('Error adding income:', err);
        throw err;
    }
}

/**
 * Get the remaining money balance by calculating the total income and expenses
 */
async function getMoneyBalance() {
    try {
        const [incomeResults] = await db_connection.execute('SELECT SUM(amount) AS totalIncome FROM Incomes');
        const [expenseResults] = await db_connection.execute('SELECT SUM(amount) AS totalExpense FROM Expenses');
        
        const totalIncome = incomeResults[0].totalIncome || 0;
        const totalExpense = expenseResults[0].totalExpense || 0;
        
        return `${totalIncome - totalExpense} INR`;
    } catch (err) {
        console.error('Error calculating balance:', err);
        throw err;
    }
}
