import { LitElement, html } from 'lit';
import * as echarts from 'echarts';
import { HomeAssistant } from 'custom-card-helpers';
import { WaterflowCardConfig } from './card-config';
import translations from './translations.json';

// Define types for translations
type TranslationKey = 'waterflow' | 'precipitation';

interface LanguageTranslations {
  waterflow: string;
  precipitation: string;
  [key: string]: string; // Allow other keys for future expansion
}

interface Translations {
  [language: string]: LanguageTranslations; // Allow any language code
}

/**
 * Get translation for a key in the current language
 * @param hass Home Assistant instance
 * @param key Translation key
 * @param defaultValue Default value if translation is not found
 * @returns Translated string
 */
function getTranslation(hass: HomeAssistant, key: TranslationKey, defaultValue: string): string {
  // Get current language from Home Assistant, fallback to English
  const language = hass?.language || 'en';
  
  // Cast translations to our interface for type safety
  const translationsTyped = translations as Translations;
  
  // Get translation for the current language, fallback to English if not found
  const translation = translationsTyped[language]?.[key] || 
                      translationsTyped['en']?.[key] || 
                      defaultValue;
  
  return translation;
}

// Interfaces for entity data structures (matching those in card.ts)
interface WaterflowData {
  startindex: number;
  firstdate: string;
  lastdate: string;
  data: number[];
}

interface PrecipitationData {
  startindex: number;
  firstdate: string;
  lastdate: string;
  data: number[];
}

interface HistoryData {
  history: Record<string, number[]>;
  average: number[];
  min: number[];
  max: number[];
}

interface InfoData {
  mq: number;
  mlq: number;
  mhq: number;
}

interface ChartData {
  waterflow?: WaterflowData;
  precipitation?: PrecipitationData;
  history?: HistoryData;
  info?: InfoData;
}

interface EntityIds {
  info?: string;
  waterflow?: string;
  precipitation?: string;
  history?: string;
}

export class EchartsWrapper extends LitElement {
  hass!: HomeAssistant;
  config!: WaterflowCardConfig;
  chartData!: ChartData;
  entityIds!: EntityIds;

  static properties = {
    hass: { attribute: false },
    config: { attribute: false },
    chartData: { attribute: false },
    entityIds: { attribute: false }
  };

  private chart?: echarts.ECharts;
  private resizeObserver?: ResizeObserver;
  private _initialSetupComplete = false;

  private mutationObserver?: MutationObserver;
  private resizeHandler?: () => void;

  // Check if we have everything needed to initialize
  private get _doIHaveEverything(): boolean {
    return !!this.hass && !!this.config && !!this.chartData && this.isConnected;
  }

  createRenderRoot() {
    return this; // Let HA theme styles pass through
  }

  // Called when element is inserted into the DOM
  connectedCallback() {
    super.connectedCallback();
    
    // Set up resize observer for the chart container
    const chartDom = this.querySelector('#chart') as HTMLDivElement;
    if (chartDom) {
      this.resizeObserver = new ResizeObserver(() => {
        this.ensureChartRendered();
      });
      this.resizeObserver.observe(chartDom);
      
      // Set up mutation observer to detect DOM changes
      this.mutationObserver = new MutationObserver(() => {
        this.ensureChartRendered();
      });
      
      // Observe the entire document for changes
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
      
      // Add window resize handler
      this.resizeHandler = () => this.ensureChartRendered();
      window.addEventListener('resize', this.resizeHandler);
    }
    
    // Try to initialize chart
    this.ensureChartRendered();
  }
  
  // Ensure chart is properly rendered
  private ensureChartRendered(): void {
    // Only proceed if we have everything we need
    if (!this._doIHaveEverything) return;
    
    const chartDom = this.querySelector('#chart') as HTMLDivElement;
    if (!chartDom) return;
    
    // Check if element is visible
    const isVisible = chartDom.clientWidth > 0 && chartDom.clientHeight > 0;
    
    if (isVisible) {
      // If chart doesn't exist, create it
      if (!this.chart) {
        try {
          this.chart = echarts.init(chartDom);
          this.updateChartOptions();
          this._initialSetupComplete = true;
        } catch (e) {
          console.error('Error initializing chart:', e);
        }
      } 
      // If chart exists, resize and update it
      else {
        try {
          this.chart.resize();
          this.updateChartOptions();
        } catch (e) {
          console.error('Error updating chart:', e);
        }
      }
    }
  }
  
  // Called after each update
  updated(changedProps: Map<string, unknown>) {
    // Try to ensure chart is rendered
    this.ensureChartRendered();
    
    // Update chart options if we have a chart and relevant props changed
    if (this.chart && (
      changedProps.has('hass') || 
      changedProps.has('config') || 
      changedProps.has('chartData') || 
      changedProps.has('entityIds')
    )) {
      this.updateChartOptions();
    }
  }

  // Called when element is removed from the DOM
  disconnectedCallback() {
    // Clean up resources
    if (this.chart) {
      this.chart.dispose();
      this.chart = undefined;
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = undefined;
    }
    
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = undefined;
    }
    
    super.disconnectedCallback();
  }

  // Update chart options based on current data and config
  private updateChartOptions() {
    if (!this.chart || !this.config || !this.chartData) return;
    
    try {
      // Prepare data for chart
      const xAxisData: string[] = [];
      const waterflowData: number[] = [];
      const precipitationData: number[] = [];
      
      // Process waterflow data if available
      if (this.chartData.waterflow) {
        const { startindex, firstdate, data } = this.chartData.waterflow;
        
        // Create date labels for x-axis
        const firstDate = new Date(firstdate);
        for (let i = 0; i < data.length; i++) {
          const date = new Date(firstDate);
          date.setDate(firstDate.getDate() + i);
          xAxisData.push(date.toLocaleDateString());
          waterflowData.push(data[i]);
        }
      }
      
      // Process precipitation data if available and config allows
      if (this.chartData.precipitation && this.config.show_precipitation !== false) {
        const { data } = this.chartData.precipitation;
        // Keep values positive, we'll use axis inversion instead
        precipitationData.push(...data);
        
        // Pad with zeros if waterflow data is longer
        while (precipitationData.length < waterflowData.length) {
          precipitationData.push(0);
        }
      }
      
      // Prepare series array
      const series: any[] = [];
      
      // Add waterflow series (always shown)
      if (waterflowData.length > 0) {
        series.push({
          name: 'Waterflow',
          type: 'line',
          data: waterflowData,
          yAxisIndex: 0,
          smooth: true,
          lineStyle: {
            width: 3
          }
        });
      }
      
      // Add precipitation series if enabled
      if (precipitationData.length > 0 && this.config.show_precipitation !== false) {
        series.push({
          name: 'Precipitation',
          type: 'bar',
          data: precipitationData,
          yAxisIndex: 1,
          barWidth: '80%',
          itemStyle: {
            color: '#ADD8E6'  // Light blue color
          }
        });
      }
      
      // Add MQ levels as horizontal lines if enabled
      if (this.chartData.info && this.config.show_mq_levels) {
        const { mq, mlq, mhq } = this.chartData.info;
        
        if (mq !== undefined) {
          series.push({
            name: 'MQ',
            type: 'line',
            data: new Array(xAxisData.length).fill(mq),
            yAxisIndex: 0,
            lineStyle: {
              type: 'dashed',
              width: 2
            },
            symbol: 'none'
          });
        }
        
        if (mlq !== undefined) {
          series.push({
            name: 'MLQ',
            type: 'line',
            data: new Array(xAxisData.length).fill(mlq),
            yAxisIndex: 0,
            lineStyle: {
              type: 'dashed',
              width: 2
            },
            symbol: 'none'
          });
        }
        
        if (mhq !== undefined) {
          series.push({
            name: 'MHQ',
            type: 'line',
            data: new Array(xAxisData.length).fill(mhq),
            yAxisIndex: 0,
            lineStyle: {
              type: 'dashed',
              width: 2
            },
            symbol: 'none'
          });
        }
      }
      
      // Add historical data if available and configured
      if (this.chartData.history) {
        // Add average if enabled
        if (this.config.show_average && this.chartData.history.average) {
          const averageData = this.chartData.history.average;
          // Only use the portion of average data that matches our current date range
          const startIndex = this.chartData.waterflow?.startindex || 0;
          const dataLength = waterflowData.length;
          const averageSlice = averageData.slice(startIndex, startIndex + dataLength);
          
          series.push({
            name: 'Average (1991-2022)',
            type: 'line',
            data: averageSlice,
            yAxisIndex: 0,
            lineStyle: {
              type: 'dotted',
              width: 2
            },
            symbol: 'none'
          });
        }
        
        // Add min if enabled
        if (this.config.show_min && this.chartData.history.min) {
          const minData = this.chartData.history.min;
          const startIndex = this.chartData.waterflow?.startindex || 0;
          const dataLength = waterflowData.length;
          const minSlice = minData.slice(startIndex, startIndex + dataLength);
          
          series.push({
            name: 'Min (1991-2022)',
            type: 'line',
            data: minSlice,
            yAxisIndex: 0,
            lineStyle: {
              type: 'dotted',
              width: 2
            },
            symbol: 'none'
          });
        }
        
        // Add max if enabled
        if (this.config.show_max && this.chartData.history.max) {
          const maxData = this.chartData.history.max;
          const startIndex = this.chartData.waterflow?.startindex || 0;
          const dataLength = waterflowData.length;
          const maxSlice = maxData.slice(startIndex, startIndex + dataLength);
          
          series.push({
            name: 'Max (1991-2022)',
            type: 'line',
            data: maxSlice,
            yAxisIndex: 0,
            lineStyle: {
              type: 'dotted',
              width: 2
            },
            symbol: 'none'
          });
        }
        
        // Add specific historical years if configured
        if (this.config.show_history_year && this.chartData.history.history) {
          const historyYears = this.config.show_history_year === 'all' 
            ? Object.keys(this.chartData.history.history)
            : this.config.show_history_year;
          
          if (Array.isArray(historyYears)) {
            for (const year of historyYears) {
              const yearData = this.chartData.history.history[year];
              if (yearData) {
                const startIndex = this.chartData.waterflow?.startindex || 0;
                const dataLength = waterflowData.length;
                const yearSlice = yearData.slice(startIndex, startIndex + dataLength);
                
                series.push({
                  name: `${year}`,
                  type: 'line',
                  data: yearSlice,
                  yAxisIndex: 0,
                  lineStyle: {
                    width: 1
                  },
                  symbol: 'none'
                });
              }
            }
          }
        }
      }
      
      // Find today's index in the data array
      let todayIndex = -1;
      if (xAxisData.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day
        
        for (let i = 0; i < xAxisData.length; i++) {
          const dateParts = xAxisData[i].split('/');
          // Assuming MM/DD/YYYY format from toLocaleDateString()
          if (dateParts.length === 3) {
            const month = parseInt(dateParts[0]) - 1; // 0-based month
            const day = parseInt(dateParts[1]);
            const year = parseInt(dateParts[2]);
            
            const dataDate = new Date(year, month, day);
            if (dataDate.getTime() === today.getTime()) {
              todayIndex = i;
              break;
            }
          }
        }
      }
      
      // Format x-axis labels: first day of month as "Jan 1", others as just day number
      const formattedXAxisData = xAxisData.map(dateStr => {
        const date = new Date(dateStr);
        const day = date.getDate();
        
        // First day of month
        if (day === 1) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${monthNames[date.getMonth()]} ${day}`;
        } 
        // Other days
        return day.toString().padStart(2, '0');
      });
      
        // Create yAxis array - always include waterflow axis
        const yAxisArray: any[] = [
          { 
            type: 'value',
            name: getTranslation(this.hass, 'waterflow', 'Waterflow (m³/s)'),
            position: 'left',
            nameLocation: 'middle',
            nameGap: 25,  // Decreased to bring title closer to axis
            nameRotate: 90,
            axisLabel: {
              margin: 6  // Reduced margin for axis labels
            }
          }
        ];
        
        // Only add precipitation axis if we have precipitation data and it's configured to be shown
        if (precipitationData.length > 0 && this.config.show_precipitation !== false) {
          yAxisArray.push({
            type: 'value',
            name: getTranslation(this.hass, 'precipitation', 'Precipitation (mm)'),
            position: 'right',
            nameLocation: 'middle',
            nameGap: 25,
            nameRotate: 90,
            axisLabel: {
              margin: 6
            },
            // Simply invert the axis to make bars go from top to bottom
            inverse: true
          });
        }
        
      // Set chart options with title explicitly hidden
      const options = {
        title: { show: false },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          legend: {
            show: this.config.show_legend === true, // Default to false if not specified
            data: series.map(s => s.name),
            bottom: 0 // Revert back to original position
          },
          grid: {
            left: '8%',  // Further increased to accommodate rotated y-axis label
            right: precipitationData.length > 0 && this.config.show_precipitation !== false ? '8%' : '4%', // Adjust right margin based on precipitation visibility
            bottom: this.config.show_legend === true ? '20%' : '5%', // Increased from 15% to 20% when legend is shown
            top: '10%',  // Reduced since we removed the title
            containLabel: true
          },
          xAxis: { 
            type: 'category', 
            data: formattedXAxisData, // Use our formatted dates
            boundaryGap: false
          },
          yAxis: yAxisArray,
        series: series.map(s => {
          // Add today marker line to the main waterflow series
          if (s.name === 'Waterflow' && todayIndex >= 0) {
            // Get today's date for the label
            const today = new Date();
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const formattedDate = `${monthNames[today.getMonth()]} ${today.getDate()}`;
            
            return {
              ...s,
              markLine: {
                symbol: ['none', 'none'],
                silent: true,
                lineStyle: {
                  color: '#999',
                  type: 'dashed',
                  width: 2  // Increased from 1 to 2 to make the line thicker
                },
                label: {
                  show: false  // Hide the label completely
                },
                data: [
                  { xAxis: todayIndex }
                ]
              }
            };
          }
          return s;
        })
      };
      
      // Apply options to chart
      this.chart.setOption(options, true); // Use true to clear previous options
    } catch (error) {
      console.error('Error updating chart options:', error);
    }
  }

  // Render the chart container with dimensions based on legend visibility
  render() {
    // Adjust height based on whether legend is shown
    const chartHeight = this.config?.show_legend === true ? '300px' : '260px';
    
    return html`
      <div id="chart" style="height: ${chartHeight}; width: 100%; min-height: ${chartHeight}; min-width: 100px;"></div>
    `;
  }
}

// Register the custom element
customElements.define('echarts-wrapper', EchartsWrapper);