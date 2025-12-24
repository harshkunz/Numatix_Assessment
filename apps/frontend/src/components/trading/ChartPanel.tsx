'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from 'lightweight-charts';
import { tradingService } from '../../services/trading.service';

type CandleSeries = ISeriesApi<'Candlestick'>;
type Timeframe = '1m' | '5m' | '1d' | '1w';

export default function ChartPanel({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<CandleSeries | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>('1m');

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height: 420,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#111827',
      },

      grid: {
        vertLines: { color: '#eef2f7' },
        horzLines: { color: '#eef2f7' },
      },

      // PRICE LEFT SIDE
      rightPriceScale: { visible: false },
      leftPriceScale: {
        visible: true,
        borderVisible: false,
      },

      // TIME AXIS (MONTHS / DATES)
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 12,
        minBarSpacing: 8,
        borderVisible: false,
        rightBarStaysOnScroll: true,
      },

      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },

      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    seriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      borderVisible: false,
    });

    // Responsive resize
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      wsRef.current?.close();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (!seriesRef.current || !chartRef.current) return;

      const candles = await tradingService.getCandles(symbol, timeframe);

      seriesRef.current.setData(
        candles.map((c: any) => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );

      chartRef.current.timeScale().fitContent();
    };

    loadHistory();
  }, [symbol, timeframe]);

  useEffect(() => {
    wsRef.current?.close();

    if (timeframe !== '1m' && timeframe !== '5m') return;
    if (!seriesRef.current) return;

    const ws = new WebSocket(
      `wss://stream.testnet.binance.vision/ws/${symbol.toLowerCase()}@kline_${timeframe}`
    );

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const k = msg.k;

      seriesRef.current?.update({
        time: (k.t / 1000) as Time,
        open: Number(k.o),
        high: Number(k.h),
        low: Number(k.l),
        close: Number(k.c),
      });
    };

    wsRef.current = ws;

    return () => ws.close();
  }, [symbol, timeframe]);

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold">{symbol.replace('USDT', '/USDT')}</h2>
        </div>

        <div className="flex gap-2">
          {(['1m', '5m', '1d', '1w'] as Timeframe[]).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-md text-sm border transition ${
                timeframe === tf
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="w-full h-[420px]" />
    </div>
  );
}
