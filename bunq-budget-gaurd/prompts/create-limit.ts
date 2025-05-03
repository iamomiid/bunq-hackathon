export const createLimitPrompt = (description: string) => `
Extract budget limit details from this user input: "${description}". 
Return a JSON object with these properties:
- title: The title of the budget limit
- category: The spending category (e.g., groceries, entertainment, takeaways)
- amount: The monetary amount (as a number)
- currency: The currency symbol (e.g., €, $)
- period: The time period (e.g., day, week, month)
- strictness: Estimated strictness level (flexible, moderate, strict) based on wording
`;
