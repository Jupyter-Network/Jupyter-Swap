import { Container, ContainerButton, ContainerTitle } from "../../theme";
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
import ChartTitleMenu from "./ChartTitleMenu";
export default function LightChart({ blockData, onBucketChange,open }) {
  const chartContainerRef = useRef();
  const chart = useRef();
  const resizeObserver = useRef();
  let candleSeries;

  useEffect(() => {
    if (chartContainerRef.current && blockData.priceHistory) {
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


      candleSeries = chart.current.addCandlestickSeries({
        upColor: primary,
        downColor: secondary,
        borderDownColor: secondary,
        borderUpColor: primary,
        wickDownColor: secondary,
        wickUpColor: primary,
      });

      var priceData = [];
      let history = blockData.priceHistory;
      history.reverse();
      for (let i = 0; i < history.length; i++) {
        if (i === 0) {
          let item = history[0];

          priceData.push({
            time: Date.parse(item.bucket) / 1000,
            open: item.open === null ? 0 : item.open,
            high: item.high === null || isNaN(item.high) ? 0 : item.high,
            low: item.low === null || isNaN(item.low) ? 0 : item.low,
            close:
              item.close === null ? blockData.priceHistory[i + 1] : item.close,
          });

          continue;
        }
        let item = history[i];

        priceData.push({
          time: Date.parse(item.bucket) / 1000,
          open: item.open === null ? 0 : history[i - 1].close,
          high:
            item.high === null || isNaN(item.high)
              ? history[i - 1].close
              : item.high,
          low:
            item.low === null || isNaN(item.low)
              ? history[i - 1].close
              : item.low,
          close: item.close === null ? 0 : item.close,
        });
      }
      priceData = priceData.map((item) => {
        return {
          time: item.time,
          open: isNaN(item.open) || item.open == null ? 0 : item.open,
          high: isNaN(item.high) || item.high == null ? 0 : item.high,
          low: isNaN(item.low) || item.low == null ? 0 : item.low,
          close: isNaN(item.close) ? 0 : item.close,
        };
      });

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
          transition: "0.2s",
          width: open ? "100vw":"0px",
          maxWidth: "775px",
          maxHeight: open ? "620px": "0px",
          zIndex: 0,
        }}
      >
        <ContainerTitle style={{ marginBottom: 0 }}>
          {" "}
          Chart &nbsp;
          <ChartTitleMenu onChange={onBucketChange} />
        </ContainerTitle>
        <div
          ref={chartContainerRef}
          className="chart-container"
          style={{ height: "590px" }}
        />
      </Container>
    </>
  );
}
