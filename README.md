# Waterflow Card

A Lovelace card for Home Assistant that visualizes waterflow, precipitation, and historical reference data from the Waterflow custom component.

![Waterflow Card](https://github.com/Kaptensanders/waterflow-card/raw/main/images/card-example.png)

## Features

- Display waterflow data with a beautiful chart interface
- Show precipitation data on a secondary axis
- Compare current data with historical references
- Responsive design that works on desktop and mobile
- Customizable appearance

## Requirements

- Home Assistant with the [Waterflow custom component](https://github.com/Kaptensanders/waterflow) installed
- HACS (Home Assistant Community Store)

## Installation

### HACS (Recommended)

1. Make sure you have [HACS](https://hacs.xyz/) installed
2. Go to HACS → Frontend
3. Click the "+ Explore & Download Repositories" button
4. Search for "Waterflow Card"
5. Click Download
6. Restart Home Assistant

### Manual Installation

1. Download the `waterflow-card.js` file from the [latest release](https://github.com/Kaptensanders/waterflow-card/releases/latest)
2. Upload it to your Home Assistant instance using the file editor or via SFTP
3. Place the file in your `config/www` directory
4. Add a reference to the card in your `ui-lovelace.yaml` or through the UI:

```yaml
resources:
  - url: /local/waterflow-card.js
    type: module
```

5. Restart Home Assistant

## Configuration

Add the card to your Lovelace dashboard with the following configuration:

```yaml
type: custom:waterflow-card
device: ljordalen  # OR use info_entity
# info_entity: sensor.ljordalen_info
name: Ljordalen Waterflow
show_header: true
```

### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| type | string | Yes | | Must be `custom:waterflow-card` |
| device | string | Yes* | | Device identifier (e.g., location name) |
| info_entity | string | Yes* | | Entity ID for the info sensor |
| name | string | No | Waterflow | Custom title for the card |
| show_header | boolean | No | true | Whether to show the header |

*Either `device` or `info_entity` must be specified

## Entities Used

The card automatically uses the following entities based on your device name:

- `sensor.<device>_waterflow` - Main waterflow data
- `sensor.<device>_precipitation` - Precipitation data
- `sensor.<device>_waterflow_history` - Historical waterflow data
- `sensor.<device>_info` - Information entity with attributes

## Development

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/Kaptensanders/waterflow-card.git
cd waterflow-card

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