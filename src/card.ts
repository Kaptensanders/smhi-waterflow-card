import { html, LitElement, nothing } from 'lit';
import { HomeAssistant, LovelaceCard } from 'custom-card-helpers';
import { WaterflowCardConfig } from './card-config';
import './echarts-wrapper';
import { cardStyle } from './styles';

// Interfaces for entity data structures
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

/**
 * Waterflow Card for Home Assistant
 * Displays waterflow, precipitation, and historical reference data
 */
export class WaterflowCard extends LitElement implements LovelaceCard {
  private _hass!: HomeAssistant;
  _config!: WaterflowCardConfig;
  private _error?: string;
  private _chartData: ChartData = {};
  private _entityIds: EntityIds = {};
  
  static styles = cardStyle;
  
  static properties = {
    _hass: { attribute: false },
    _config: { state: true },
    _error: { state: true },
    _chartData: { state: true },
    _entityIds: { state: true }
  };
  
  /**
   * Sets the card configuration and validates required fields
   */
  public setConfig(config: WaterflowCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    
    if (!config.info_entity_id) {
      throw new Error('You must define "info_entity_id" in the config');
    }

    // Validate type
    if (config.type !== 'custom:smhi-waterflow-card') {
      console.warn('Unexpected card type:', config.type);
    }

    this._config = {
      name: config.name ?? 'SMHI Waterflow',
      show_header: config.show_header !== false,
      show_precipitation: config.show_precipitation !== false,
      show_average: config.show_average !== false,
      show_mq_levels: config.show_mq_levels ?? false,
      show_min: config.show_min ?? false,
      show_max: config.show_max ?? false,
      show_history_year: config.show_history_year ?? null,
      show_legend: config.show_legend ?? false, // Default to false - hide legend
      ...config,
    };
    
    // Derive entity IDs from info_entity_id
    this._deriveEntityIds(config.info_entity_id);
    
    this._error = undefined;
    this._chartData = {};
  }

  /**
   * Returns the card size for layout calculations
   */
  public getCardSize(): number {
    return 4;
  }

  /**
   * Getter for hass property
   */
  public get hass(): HomeAssistant {
    return this._hass;
  }

  /**
   * Setter for hass property - called when Home Assistant state changes
   */
  public set hass(hass: HomeAssistant) {
    const oldHass = this._hass;
    this._hass = hass;
    
    // Check if any of our entities have changed
    if (this._entityIds) {
      const entitiesChanged = Object.values(this._entityIds).some(
        entityId => entityId && 
        (!oldHass || !oldHass.states[entityId] || 
         oldHass.states[entityId] !== hass.states[entityId])
      );
      
      if (entitiesChanged) {
        this._extractEntityData();
      }
    }
  }

  /**
   * Derives related entity IDs from the info entity ID
   * For example, if info_entity_id is sensor.ljordalen_info:
   * - Waterflow entity: sensor.ljordalen_waterflow
   * - Precipitation entity: sensor.ljordalen_precipitation
   * - History entity: sensor.ljordalen_waterflow_history
   */
  private _deriveEntityIds(infoEntityId: string): void {
    if (!infoEntityId) {
      this._entityIds = {};
      return;
    }
    
    // Extract the base name (e.g., "ljordalen" from "sensor.ljordalen_info")
    const match = infoEntityId.match(/^([^.]+)\.([^_]+)_info$/);
    if (!match) {
      this._error = `Invalid info entity ID format: ${infoEntityId}`;
      this._entityIds = { info: infoEntityId };
      return;
    }
    
    const [, domain, baseName] = match;
    
    this._entityIds = {
      info: infoEntityId,
      waterflow: `${domain}.${baseName}_waterflow`,
      precipitation: `${domain}.${baseName}_precipitation`,
      history: `${domain}.${baseName}_waterflow_history`
    };
    
    // Derived entity IDs are now available in this._entityIds
  }

  /**
   * Extracts data from the Home Assistant entities
   */
  private _extractEntityData(): void {
    if (!this._hass || !this._entityIds.info) {
      return;
    }
    
    try {
      // Extract data from info entity
      if (this._entityIds.info && this._hass.states[this._entityIds.info]) {
        const infoEntity = this._hass.states[this._entityIds.info];
        this._chartData.info = {
          mq: infoEntity.attributes.mq,
          mlq: infoEntity.attributes.mlq,
          mhq: infoEntity.attributes.mhq
        };
      }
      
      // Extract data from waterflow entity
      if (this._entityIds.waterflow && this._hass.states[this._entityIds.waterflow]) {
        const waterflowEntity = this._hass.states[this._entityIds.waterflow];
        this._chartData.waterflow = {
          startindex: waterflowEntity.attributes.startindex,
          firstdate: waterflowEntity.attributes.firstdate,
          lastdate: waterflowEntity.attributes.lastdate,
          data: waterflowEntity.attributes.data
        };
      }
      
      // Extract data from precipitation entity
      if (this._entityIds.precipitation && this._hass.states[this._entityIds.precipitation]) {
        const precipitationEntity = this._hass.states[this._entityIds.precipitation];
        this._chartData.precipitation = {
          startindex: precipitationEntity.attributes.startindex,
          firstdate: precipitationEntity.attributes.firstdate,
          lastdate: precipitationEntity.attributes.lastdate,
          data: precipitationEntity.attributes.data
        };
      }
      
      // Extract data from history entity
      if (this._entityIds.history && this._hass.states[this._entityIds.history]) {
        const historyEntity = this._hass.states[this._entityIds.history];
        this._chartData.history = {
          history: historyEntity.attributes.history,
          average: historyEntity.attributes.average,
          min: historyEntity.attributes.min,
          max: historyEntity.attributes.max
        };
      }
    } catch (error) {
      this._handleError(error as Error);
    }
  }

  /**
   * Handle errors that occur during rendering or data processing
   */
  private _handleError(error: Error): void {
    this._error = error.message || 'Unknown error';
    console.error('Waterflow card error:', error);
    
    // Log the error to the console
    // We could add more sophisticated error handling here in the future
  }

  /**
   * Renders the card based on current state
   */
  protected render() {
    if (!this._hass || !this._config) {
      return html`<ha-card>
        <div class="warning">Card not configured</div>
      </ha-card>`;
    }

    if (this._error) {
      return html`<ha-card>
        <div class="error">
          <div>Error: ${this._error}</div>
          <mwc-button @click=${() => this._error = undefined}>Retry</mwc-button>
        </div>
      </ha-card>`;
    }

    try {
      // Extract data from entities if we haven't already
      if (Object.keys(this._chartData).length === 0) {
        this._extractEntityData();
      }
      
      const { name, show_header } = this._config;

      return html`
        <ha-card>
          ${show_header ? html`<h2>${name}</h2>` : nothing}
          <echarts-wrapper
            .hass=${this._hass}
            .config=${this._config}
            .chartData=${this._chartData}
            .entityIds=${this._entityIds}
          ></echarts-wrapper>
        </ha-card>
      `;
    } catch (error) {
      this._handleError(error as Error);
      return html`<ha-card>
        <div class="error">Error rendering card</div>
      </ha-card>`;
    }
  }
}

// Register the custom element
customElements.define('smhi-waterflow-card', WaterflowCard);