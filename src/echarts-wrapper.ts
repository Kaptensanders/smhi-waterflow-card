import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import * as echarts from 'echarts';
import { HomeAssistant } from 'custom-card-helpers';
import { WaterflowCardConfig } from './card-config';

@customElement('echarts-wrapper')
export class EchartsWrapper extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config!: WaterflowCardConfig;

  private chart?: echarts.ECharts;

  createRenderRoot() {
    return this; // Let HA theme styles pass through
  }

  firstUpdated() {
    const chartDom = this.querySelector('#chart') as HTMLDivElement;
    this.chart = echarts.init(chartDom);

    this.chart.setOption({
      title: { text: 'Waterflow (WIP)' },
      tooltip: {},
      xAxis: { type: 'category', data: [] },
      yAxis: [{ type: 'value' }, { type: 'value' }],
      series: [
        {
          name: 'Waterflow',
          type: 'line',
          data: []
        },
        {
          name: 'Precipitation',
          type: 'bar',
          yAxisIndex: 1,
          data: []
        }
      ]
    });
  }

  render() {
    return html`<div id="chart" style="height: 300px; width: 100%;"></div>`;
  }
}
