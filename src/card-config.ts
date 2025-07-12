export interface WaterflowCardConfig {
  type: string;

  // Required: One of these must be set
  device?: string;
  info_entity?: string;

  // Optional config options
  name?: string;
  show_header?: boolean;
}
