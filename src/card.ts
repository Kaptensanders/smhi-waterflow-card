import { html, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCard } from 'custom-card-helpers';
import { WaterflowCardConfig } from './card-config';
import './echarts-wrapper';
import { cardStyle } from './styles';
static styles = cardStyle;


@customElement('waterflow-card')
export class WaterflowCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: WaterflowCardConfig;

  public setConfig(config: WaterflowCardConfig): void {
    if (!config.device && !config.info_entity) {
      throw new Error('You must define either "device" or "info_entity" in the config');
    }

    this._config = {
      name: config.name ?? 'Waterflow',
      show_header: config.show_header !== false,
      ...config,
    };
  }

  public getCardSize(): number {
    return 4;
  }

  protected render() {
    if (!this.hass || !this._config) return html``;

    const { name, show_header } = this._config;

    return html`
      <ha-card>
        ${show_header ? html`<h2>${name}</h2>` : null}
        <echarts-wrapper
          .hass=${this.hass}
          .config=${this._config}
        ></echarts-wrapper>
      </ha-card>
    `;
  }

