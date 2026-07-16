import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useEnhancedStock } from '@/context/EnhancedStockContext';
import { useToast } from '@/hooks/use-toast';

const INDICATORS = [
  { id: 'MASimple@tv-basicstudies', label: 'Moving Average (SMA)' },
  { id: 'MAExp@tv-basicstudies', label: 'Exponential MA (EMA)' },
  { id: 'BB@tv-basicstudies', label: 'Bollinger Bands' },
  { id: 'RSI@tv-basicstudies', label: 'RSI' },
  { id: 'MACD@tv-basicstudies', label: 'MACD' },
  { id: 'Stochastic@tv-basicstudies', label: 'Stochastic' },
  { id: 'Volume@tv-basicstudies', label: 'Volume' },
  { id: 'IchimokuCloud@tv-basicstudies', label: 'Ichimoku Cloud' },
  { id: 'PSAR@tv-basicstudies', label: 'Parabolic SAR' },
  { id: 'AwesomeOscillator@tv-basicstudies', label: 'Awesome Oscillator' },
];

function buildTvSymbol(symbol: string, type: string) {
  const s = symbol.toUpperCase();
  if (type === 'indian') return `NSE:${s}`;
  if (type === 'crypto') return `BINANCE:${s}USDT`;
  return `NASDAQ:${s}`;
}

export default function StockDetail() {
  const { type = 'us', symbol = '' } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [studies, setStudies] = useState<string[]>(['Volume@tv-basicstudies']);
  const { watchlist, addToWatchlist } = useEnhancedStock();
  const { toast } = useToast();

  const inWatchlist = watchlist.some(
    (s) => s.symbol === symbol.toUpperCase() && s.stockType === type
  );

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '<div id="tv_chart_container" style="height:600px;width:100%"></div>';

    const scriptId = 'tradingview-tv-js';
    const initWidget = () => {
      // @ts-ignore
      if (!window.TradingView) return;
      // @ts-ignore
      new window.TradingView.widget({
        autosize: true,
        symbol: buildTvSymbol(symbol, type),
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        withdateranges: true,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        studies,
        container_id: 'tv_chart_container',
      });
    };

    if (document.getElementById(scriptId)) {
      initWidget();
    } else {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initWidget;
      document.body.appendChild(script);
    }
  }, [symbol, type, studies]);

  const toggleStudy = (id: string) => {
    setStudies((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    await addToWatchlist({
      symbol: symbol.toUpperCase(),
      name: symbol.toUpperCase(),
      price: 0,
      change: 0,
      changePercent: 0,
      stockType: type as 'us' | 'indian' | 'crypto',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{symbol.toUpperCase()}</h1>
                <Badge variant="outline" className="uppercase">{type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Live chart & technical indicators</p>
            </div>
          </div>
          {!inWatchlist && (
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" /> Add to Watchlist
            </Button>
          )}
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {INDICATORS.map((ind) => {
                const active = studies.includes(ind.id);
                return (
                  <Button
                    key={ind.id}
                    size="sm"
                    variant={active ? 'default' : 'outline'}
                    onClick={() => toggleStudy(ind.id)}
                  >
                    {active ? '✓ ' : '+ '}{ind.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div ref={containerRef} style={{ height: 600, width: '100%' }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
