# Character Creator

This project uses Excel data to generate random characters for various genres.
All character data is stored in `character_generation_schema.xlsx` and exported
to JSON for the web interface.

## Generating JSON Files

1. Install Python 3 and the required packages:
   ```bash
   pip install pandas openpyxl
   ```
2. Run the export script from this directory:
   ```bash
   python3 character_generation.py character_generation_schema.xlsx
   ```
   This creates a `json/` folder containing one JSON file per worksheet.

> **Note**: The `json/` directory is not committed to version control. Run the
> script again whenever the Excel workbook changes to regenerate these files.

## Launching the Web App

After generating the JSON, start a simple HTTP server and open the HTML file:

```bash
python3 -m http.server
```

Then visit `http://localhost:8000/character_generator.html` in your browser.


