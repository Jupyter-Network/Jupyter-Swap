import { Container, ContainerTitle } from "../../theme";
import {
  background,
  primary,
  secondary,
  tintedBackground,
} from "../../theme/theme";

import BN from "bignumber.js";
import { useEffect, useState, useI, Component, createRef, useRef } from "react";
import equal from "fast-deep-equal";
import { _scaleDown } from "../../utils/mathHelper";
import { createChart, CrosshairMode } from "lightweight-charts";
export default function LightChart({ blockData, tokens }) {
  const chartContainerRef = useRef();
  const chart = useRef();
  const resizeObserver = useRef();
  let candleSeries;

  useEffect(() => {
    if (chartContainerRef.current && blockData.priceHistory) {
      console.log("Update Price", candleSeries);
      if (chart.current) chart.current.remove();
      chart.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        layout: {
          backgroundColor: background,
          textColor: primary,
        },
        grid: {
          vertLines: {
            color: "gray",
          },
          horzLines: {
            color: "gray",
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        priceScale: {
          borderColor: primary,
        },
        timeScale: {
          borderColor: primary,
          timeVisible: true,
        },
      });

      console.log(chart.current);

      candleSeries = chart.current.addCandlestickSeries({
        upColor: primary,
        downColor: secondary,
        borderDownColor: secondary,
        borderUpColor: primary,
        wickDownColor: secondary,
        wickUpColor: primary,
      });

      let priceData = [];
      for (let i = 0; i < blockData.priceHistory.length; i++) {
        if (i === 0) continue;
        let item = blockData.priceHistory[i];
        console.log("Item: ", item.low.toString(), !isNaN(item.low));
        priceData.push({
          time: Date.parse(item.bucket) / 1000,
          open:
            item.open === null
              ? 0
              : BN(blockData.priceHistory[i - 1].close)
                  .dividedBy(BN(10).pow(18))
                  .toString(),
          high:
            item.high === null || isNaN(item.high)
              ? BN(blockData.priceHistory[i - 1].close)
                  .dividedBy(BN(10).pow(18))
                  .toString()
              : BN(item.high).dividedBy(BN(10).pow(18)).toString(),
          low:
           item.low === null || isNaN(item.low)
              ? BN(blockData.priceHistory[i - 1].close)
                  .dividedBy(BN(10).pow(18))
                  .toString()
              : BN(item.low).dividedBy(BN(10).pow(18)).toString(),
          close:
            item.close === null
              ? 0
              : BN(item.close).dividedBy(BN(10).pow(18)).toString(),
        });
      }
      priceData = priceData.map((item) => {
        return {
          time: item.time,
          open: isNaN(item.open) ? 0 : item.open,
          high: isNaN(item.high) ? 0 : item.high,
          low: isNaN(item.low) ? 0 : item.low,
          close: isNaN(item.close) ? 0 : item.close,
        };
      });
      console.log("CANDLEPRICEDATA:", priceData);

      candleSeries.setData(priceData);

      // const areaSeries = chart.current.addAreaSeries({
      //   topColor: 'rgba(38,198,218, 0.56)',
      //   bottomColor: 'rgba(38,198,218, 0.04)',
      //   lineColor: 'rgba(38,198,218, 1)',
      //   lineWidth: 2
      // });

      // areaSeries.setData(areaData);

      //const volumeSeries = chart.current.addHistogramSeries({
      //  color: "#182233",
      //  lineWidth: 2,
      //  priceFormat: {
      //    type: "volume",
      //  },
      //  overlay: true,
      //  scaleMargins: {
      //    top: 0.8,
      //    bottom: 0,
      //  },
      //});
      //
      //volumeSeries.setData(volumeData);
    }
  }, [blockData]);

  // Resize chart on container resizes.
  useEffect(() => {
    resizeObserver.current = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      chart.current.applyOptions({ width, height });
      setTimeout(() => {
        chart.current.timeScale().fitContent();
      }, 0);
    });

    resizeObserver.current.observe(chartContainerRef.current);

    return () => resizeObserver.current.disconnect();
  }, []);

  return (
    <>
      <Container
        style={{
          width: "100vw",
          maxWidth: "775px",
          maxHeight: "620px",
          zIndex: 1,
        }}
      >
        <ContainerTitle style={{ marginBottom: 0 }}> Chart</ContainerTitle>
        <div
          ref={chartContainerRef}
          className="chart-container"
          style={{ height: "590px" }}
        />
      </Container>
    </>
  );
}
