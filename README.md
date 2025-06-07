# Money Moves Central

A comprehensive financial management application that helps users track expenses, manage transactions, and monitor their investment portfolio.

## Features

- 📊 Expense Tracking
- 💰 Transaction Management
- 📈 Real-time Stock Portfolio
- 🔐 User Authentication
- 📱 Responsive Design

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Router
- React Query

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/money-moves-central.git
cd money-moves-central
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
money-moves-central/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── public/             # Static assets
└── package.json        # Project dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
