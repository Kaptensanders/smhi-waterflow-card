# SMHI Waterflow Card

A Lovelace card for Home Assistant that visualizes waterflow, precipitation, and historical reference data from the SMHI Waterflow integration.

![Waterflow Card](https://github.com/Kaptensanders/smhi-waterflow-card/raw/main/images/card-example.png)

## Features

- Display current and forecast waterflow data with an interactive chart
- Show precipitation data on an inverted secondary axis
- Compare current data with historical references:
  - Average waterflow (1991-2022)
  - Minimum and maximum historical values
  - Reference flow levels (MQ, MLQ, MHQ)
  - Specific historical years for comparison
- Mark today's date with a vertical reference line
- Interactive tooltips showing precise values
- Responsive design that works on desktop and mobile
- Internationalization support (currently English and Swedish)
- Customizable appearance through various configuration options

## Requirements

- Home Assistant with the [SMHI Waterflow integration](https://github.com/Kaptensanders/smhi-waterflow) installed and configured
- HACS (Home Assistant Community Store) for easy installation

## Installation

### HACS (Recommended)

1. Make sure you have [HACS](https://hacs.xyz/) installed
2. Go to HACS → Frontend
3. Click the "+ Explore & Download Repositories" button
4. Search for "SMHI Waterflow Card"
5. Click Download
6. Restart Home Assistant

### Manual Installation

1. Download the latest release from the [GitHub repository](https://github.com/Kaptensanders/smhi-waterflow-card/releases/latest)
2. Upload the `smhi-waterflow-card.js` file to your Home Assistant instance using the file editor or via SFTP
3. Place the file in your `config/www` directory
4. Add a reference to the card in your Lovelace resources:

```yaml
resources:
  - url: /local/smhi-waterflow-card.js
    type: module
```

5. Restart Home Assistant

## Configuration

Add the card to your Lovelace dashboard with the following configuration:

```yaml
type: custom:smhi-waterflow-card
info_entity_id: sensor.my_river_info
name: My River Waterflow
show_precipitation: true
show_average: true
show_mq_levels: true
show_min: false
show_max: false
show_legend: true
```

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

## Development

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/Kaptensanders/smhi-waterflow-card.git
cd smhi-waterflow-card

# Install dependencies
npm install

# Build the card
npm run build

# For development with auto-rebuild
npm run watch
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.