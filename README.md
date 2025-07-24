# SMHI Waterflow Card

A Lovelace card for Home Assistant that visualizes waterflow, precipitation, and historical reference data from the SMHI Waterflow integration.

## Installation
- HACS (Home Assistant Community Store) for easy installation
- Install and configure [SMHI Waterflow integration](https://github.com/Kaptensanders/smhi-waterflow)
- Install SMHI Waterflow Card with HACS

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | string | Required | Must be `custom:smhi-waterflow-card` |
| `info_entity_id` | string | Required | The info sensor entity ID (e.g., `sensor.my_river_info`) |
| `name` | string | "SMHI Waterflow" | Card title |
| `show_header` | boolean | true | Whether to show the card header |
| `show_precipitation` | boolean | true | Whether to show precipitation data as bars |
| `show_average` | boolean | true | Whether to show average historical data (1991-2022) |
| `show_mq_levels` | boolean | false | Whether to show reference flow levels (MQ, MLQ, MHQ) |
| `show_min` | boolean | false | Whether to show minimum historical data |
| `show_max` | boolean | false | Whether to show maximum historical data |
| `show_history_year` | string[] or "all" | null | Show specific historical years (e.g., ["2018", "2022"]) or "all" for all years |
| `show_legend` | boolean | false | Whether to show the chart legend |

## Chart Features

### Main Data Series

- **Waterflow**: Displayed as a blue line chart showing current and forecast waterflow in m³/s
- **Precipitation**: Displayed as light blue bars from the top, showing precipitation in mm (when enabled)

### Reference Lines

- **MQ (Mean Flow)**: Dashed horizontal line showing the mean flow level
- **MLQ (Mean Low Flow)**: Dashed horizontal line showing the mean low flow level
- **MHQ (Mean High Flow)**: Dashed horizontal line showing the mean high flow level
- **Today**: Vertical dashed line marking the current date

### Historical References

- **Average (1991-2022)**: Dotted line showing the average waterflow for each day of the year
- **Min (1991-2022)**: Dotted line showing the minimum historical waterflow
- **Max (1991-2022)**: Dotted line showing the maximum historical waterflow
- **Historical Years**: Individual lines for specific years when configured

## Internationalization

The card automatically uses the language set in Home Assistant. Currently supported languages:

- English
- Swedish

## Examples

### Basic Configuration

```yaml
type: custom:smhi-waterflow-card
info_entity_id: sensor.ljordalen_info
name: Ljordalen Waterflow
```

### Showing All Historical References

```yaml
type: custom:smhi-waterflow-card
info_entity_id: sensor.ljordalen_info
name: Ljordalen Waterflow
show_precipitation: true
show_average: true
show_mq_levels: true
show_min: true
show_max: true
show_legend: true
```

### Comparing with Specific Historical Years

```yaml
type: custom:smhi-waterflow-card
info_entity_id: sensor.ljordalen_info
name: Ljordalen Waterflow
show_precipitation: true
show_average: true
show_history_year: ["2018", "2022"]
show_legend: true
```

## Troubleshooting

If the card doesn't display properly:

1. Check that the SMHI Waterflow integration is properly configured and the entities exist
2. Verify that the `info_entity_id` is correct and points to a valid entity
3. Check the browser console for any JavaScript errors
4. Try refreshing the page or restarting Home Assistant
