import readline from 'node:readline/promises';    // This package helps us to (reads/take input data) from termials 
import db_connection from './db_connection.js';
import Groq from 'groq-sdk';


// const expenseDB = [];
// const incomeDB = [];

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callAgent() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const messages = [
        {
            role: 'system',
            content: `You are Josh, a personal finance assistant. Your task is to assist user with their expenses, balances and financial planning.
            You have access to following tools:
            1. getTotalExpense({from, to}): string // Get total expense for a time period.
            2. addExpense({name, amount}): string // Add new expense to the expense database.
            3. addIncome({name, amount}): string // Add new income to income database.
            3. getMoneyBalance(): string // Get remaining money balance from database.

            current datetime: ${new Date().toUTCString()}`,
        },
    ];

    // this outer loop is for user prompt loop
    while (true) {
        const question = await rl.question('User: ');

        if (question === 'bye') {
            break;
        }

        messages.push({
            role: 'user',
            content: question,
        });

        // this inner loop is for agent calling 
        while (true) {
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

            // console.log(JSON.stringify(completion.choices[0], null, 2));
            messages.push(completion.choices[0].message);

            const toolCalls = completion.choices[0].message.tool_calls;
            if (!toolCalls) {
                console.log(`Assistant: ${completion.choices[0].message.content}`);
                break;
            }

            for (const tool of toolCalls) {
                const functionName = tool.function.name;
                const functionArgs = tool.function.arguments;

                let result = '';
                if (functionName === 'getTotalExpense') {
                    result = await getTotalExpense(JSON.parse(functionArgs));
                } else if (functionName === 'addExpense') {
                    result = await addExpense(JSON.parse(functionArgs));
                } else if (functionName === 'addIncome') {
                    result = await addIncome(JSON.parse(functionArgs));
                } else if (functionName === 'getMoneyBalance') {
                    result = await getMoneyBalance(JSON.parse(functionArgs));
                }

                messages.push({
                    role: 'tool',
                    content: result,
                    tool_call_id: tool.id,
                });
                // console.log(JSON.stringify(completion2.choices[0], null, 2));
            }

            // console.log('===============');
            // console.log('MESSAGES:', messages);
            // console.log('===============');
            // console.log('DB: ', expenseDB);
        }
    }

    rl.close();
}
callAgent();

/**
 * Get total expense
 */

async function getTotalExpense({ from, to }) {
    // console.log('Calling getTotalExpense tool');
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

    // In reality -> we call db here...
    // const expense = expenseDB.reduce((acc, item) => {
    //     return acc + item.amount;
    // }, 0);
    // return `${expense} INR`;
}

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

    // console.log(`Adding ${amount} to expense db for ${name}`);
    // expenseDB.push({ name, amount });
    // return 'Added to the database.';
}

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

    // incomeDB.push({ name, amount });
    // return 'Added to the income database.';
}

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

    // const totalIncome = incomeDB.reduce((acc, item) => acc + item.amount, 0);
    // const totalExpense = expenseDB.reduce((acc, item) => acc + item.amount, 0);

    // return `${totalIncome - totalExpense} INR`;
}
