# Bunq Budget Guard

**Smart budgeting with AI for your Bunq card.**

## Quick Links
- [About](docs/about.md)
- [API Reference](docs/API_Reference.md)
- [FAQ](docs/FAQ.md)
- [Features](docs/features.md)
- [Getting Started](docs/getting_started.md)
- [How It Works](docs/How_It_Works.md)
- [Project Structure](docs/Project_Structure.md)



## Description
Bunq Budget Guard helps you stay on budget. You write simple rules in English, like “Limit groceries to €200 per month.” Our AI watches your Bunq card, blocks purchases that break your rules, and lets you ask for a one-time unblock if you need it.

## Features
- **Natural-language rules**: Write limits in plain English  
- **AI monitoring**: Every transaction is checked automatically  
- **Automatic card blocking**: Stops your card when a limit is reached  
- **Flexible override**: Ask the AI to unblock your card for important buys  
- **Dashboard**: See limits, spending, and remaining budget

## Tech Stack
- **Next.js** for the web app  
- **AWS** amplify and rout53 for hosting
- **Node.js** for the backend
- **TypeScript** for type safety
- **React** for the frontend
- **Drizzle ORM** for database  
- **PostgreSQL** as the database  
- **Bunq API** for banking integration  
- **Neon** for the database
- **NvidiaCHAT** llama-3.1-70b-instruct for AI processing
- **OpenAI** GPT for natural-language processing  
- **Tailwind CSS** for styling  


## Getting Started

1. **Clone the repo**  
```bash
   git clone https://github.com/kooroshkz/bunq-hackathon.git
   cd bunq-hackathon
```

3. **Set up environment**

   * Copy `.env.example` to `.env`
   * Fill in your `DATABASE_URL`, `BUNQ_API_KEY`, and `BUNQ_API_TOKEN`

4. **Run in development**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**

   ```bash
   npm run build
   npm run start
   ```

## Documentation

See the **docs/** folder for more details:

* **about.md** – Project overview
* **getting-started.md** – Setup and run instructions
* **features.md** – Full feature list
* **how-it-works.md** – Explanation of the system
* **project-structure.md** – Code layout
* **api-reference.md** – API endpoints
* **contributing.md** – How to help
* **faq.md** – Common questions

## Contributing

1. Fork the project
2. Create a branch (`git checkout -b feature-name`)
3. Make your changes, follow code style, and run `npm run lint`
4. Open a Pull Request and describe your changes

## License

This project is part of a hackathon. See [LICENSE](LICENSE) for details.

---

© 2025 Bunq Budget Guard Hackathon Project
