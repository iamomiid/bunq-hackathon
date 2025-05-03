Thought for a second


# Getting Started

## Prerequisites
- **Node.js** installed on your computer (version 14 or higher)  
- A **Bunq sandbox account** for testing (you can sign up on Bunq’s website)  
- **Git** to clone the project  

## Clone the Repository
1. Open your terminal (command line).  
2. Run:  
```bash
   git clone https://github.com/your-username/bunq-budget-guard.git
   cd bunq-budget-guard
```

## Install Dependencies

In the project folder, run:

```bash
npm install
```

This installs all the code libraries we need.

## Set Environment Variables

1. Copy `.env.example` to `.env`
2. Open `.env` and fill in:
```bash
NVIDIA_API_KEY=your_nvidia_api_key_here
DATABASE_URL=your-database-url
BUNQ_API_KEY=your-bunq-api-key
BUNQ_API_TOKEN=your-bunq-session-token
```

3. Save the file.

## Run the Development Server

Start the app in development mode:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see it live.

## Build and Start for Production

To build and run in production:

```bash
npm run build
npm run start
```

The app will run on port 3000 by default.
