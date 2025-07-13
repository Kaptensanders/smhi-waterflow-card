/**
 * Configuration interface for the Waterflow Card
 */
export interface WaterflowCardConfig {
  /**
   * Type identifier for the card
   * Should be 'custom:waterflow-card'
   */
  type: string;

  
  /**
   * Info entity ID
   * Required if device is not set
   * Entity containing waterflow information
   */
  info_entity_id?: string;

  /**
   * Custom name for the card
   * Defaults to 'Waterflow' if not provided
   */
  name?: string;

  /**
   * Whether to show the header with the name
   * Defaults to true
   */
  show_header?: boolean;

  /**
   * Whether to show precipitation data
   * Defaults to true
   */
  show_precipitation?: boolean;

  /**
   * Whether to show the average waterflow from historical data
   * Defaults to true
   */
  show_average?: boolean;

  /**
   * Whether to show the MQ levels (MQ, MLQ, MHQ) from info entity
   * All three reference lines are shown together when enabled
   * Defaults to false
   */
  show_mq_levels?: boolean;

  /**
   * Whether to show the minimum waterflow from historical data
   * Defaults to false
   */
  show_min?: boolean;

  /**
   * Whether to show the maximum waterflow from historical data
   * Defaults to false
   */
  show_max?: boolean;

  /**
   * Historical years to display from waterflow_history
   * Can be:
   * - An array of year strings to show specific years (e.g., ["1991", "2000", "2022"])
   * - The string "all" to show all years from 1991-2022
   * - null or undefined to show no specific years
   */
  show_history_year?: string[] | "all" | null;

  /**
   * Whether to show the legend at the bottom of the chart
   * Defaults to false
   */
  show_legend?: boolean;
}
