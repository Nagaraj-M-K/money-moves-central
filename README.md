
# Money Moves Central - Personal Finance Management Platform

A comprehensive financial management solution built with React, TypeScript, and Tailwind CSS. Track expenses, manage transactions, monitor investments, and get AI-powered insights.

## 🚀 Features

### Core Features
- **Expense Tracking**: Categorize and track daily expenses with detailed analytics
- **Transaction Management**: Monitor income and expenses with filtering and search
- **Portfolio Management**: Track US stocks, Indian stocks, and cryptocurrencies
- **Real-time Data**: Live stock prices and market updates

### Premium Features
- **AI-Powered Insights**: Smart analysis of spending patterns and investment recommendations
- **Email Alerts**: Real-time notifications for price changes and market movements
- **Trending Stocks**: AI-curated stock suggestions based on market trends
- **Advanced Analytics**: Professional-grade financial reports and optimization tools
- **Custom Alerts**: Personalized notifications and reminders

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/UI Components
- **State Management**: React Context, React Query
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database**: LocalStorage (with easy migration path to real databases)
- **APIs**: Yahoo Finance, CoinGecko, NSE (simulated)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/money-moves-central.git
   cd money-moves-central
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Import the project
3. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify

### Manual Hosting
1. Build the project: `npm run build`
2. Upload the `dist` folder to your hosting provider

## 📊 Database Migration

The application currently uses localStorage for data persistence. To migrate to a real database:

1. **Firebase Setup**
   ```bash
   npm install firebase
   ```

2. **Supabase Setup**
   ```bash
   npm install @supabase/supabase-js
   ```

3. **MongoDB Setup**
   ```bash
   npm install mongodb
   ```

Replace the localStorage functions in `src/lib/database.ts` with your preferred database implementation.

## 🔐 Environment Variables

For production deployment, set up the following environment variables:

```env
# Stock APIs (optional - fallback to mock data)
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
VITE_FINNHUB_API_KEY=your_finnhub_key

# Database (when migrating from localStorage)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Payment Gateway (for premium features)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

## 🎨 Customization

### Themes
The application supports light/dark themes. Customize in `src/index.css`:

```css
:root {
  --primary: your-primary-color;
  --secondary: your-secondary-color;
}
```

### Features
Enable/disable features in `src/config/features.ts`:

```typescript
export const features = {
  premiumFeatures: true,
  stockTracking: true,
  cryptoTracking: true,
  aiInsights: true,
};
```

## 📱 Mobile Support

The application is fully responsive and works on:
- Desktop browsers
- Mobile browsers
- Progressive Web App (PWA) ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@moneymovescentral.com
- Discord: [Join our community]

## 🗺️ Roadmap

- [ ] Mobile app development
- [ ] Advanced AI features
- [ ] Real-time collaboration
- [ ] API for third-party integrations
- [ ] White-label solutions
- [ ] Cryptocurrency trading integration
- [ ] Tax reporting features
- [ ] Multi-currency support

---

Made with ❤️ for better financial management
