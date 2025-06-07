# Prompt Generation Tools

A tool for generating prompts based on JIRA and Confluence data using OpenAI's GPT-4.

## Features

- Generate test cases from JIRA issues and Confluence documentation
- Analyze requirements and generate clarifying questions
- Role-based prompt generation (Tester/Business Analyst)
- Workflow orchestrated with **LangGraph**

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key
- JIRA and Confluence access (if using real data)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

## Usage

Start the development server:
```bash
npm run dev
```

This project uses **LangGraph** to coordinate data retrieval and prompt generation.

Build for production (optional):
```bash
npm run build
```

Start the server (automatically compiles before running):
```bash
npm start
```

## Environment Variables

Create a `.env` file with the following variables:
```
OPENAI_API_KEY=your_api_key_here
```

## Testing

Run tests:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

ISC
