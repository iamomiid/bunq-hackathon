export const createLimitPrompt = (description: string, strictnessValue?: number) => `
Extract budget limit details from this user input: "${description}". 
Return a JSON object with these properties:
- title: The title of the budget limit
- category: The spending category (e.g., groceries, entertainment, takeaways)
- amount: The monetary amount (as a number)
- currency: The currency symbol, always should be in euro
- period: The time period (e.g., day, week, month), BY DEFAULT MONTH
`;
