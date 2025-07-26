import pandas as pd
import json
import os
import argparse

REQUIRED_SHEETS = [
    'fnames', 'lnames', 'genders', 'agegroups', 'races',
    'traits', 'occupations', 'backgrounds', 'sizes',
    'tech_levels', 'magic_affinity', 'class_types', 'genres'
]

def sanitize_dataframe(df):
    """Convert all NaNs to empty strings and enforce safe data typing."""
    df = df.fillna("")

    for col in df.columns:
        if df[col].dtype == 'float64' or df[col].dtype == 'int64':
            df[col] = df[col].apply(lambda x: int(x) if str(x).strip().isdigit() else str(x).strip())
        elif df[col].dtype == 'object':
            df[col] = df[col].astype(str).apply(lambda x: x.strip() if x.lower() != "nan" else "")
    return df

def export_to_json(excel_file, output_dir):
    print(f"📘 Loading workbook: {excel_file}")
    xlsx = pd.ExcelFile(excel_file)

    os.makedirs(output_dir, exist_ok=True)

    for sheet in REQUIRED_SHEETS:
        if sheet not in xlsx.sheet_names:
            print(f"❌ Missing required sheet: {sheet}")
            continue

        print(f"✅ Processing: {sheet}")
        df = pd.read_excel(xlsx, sheet_name=sheet)
        df = sanitize_dataframe(df)

        records = df.to_dict(orient="records")
        output_path = os.path.join(output_dir, f"{sheet}.json")

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2, ensure_ascii=False)

        print(f"💾 Exported to {output_path}")

    print("🎉 Export complete.")

def main():
    parser = argparse.ArgumentParser(description="Export character generation Excel data to JSON.")
    parser.add_argument("excel_file", help="Path to the Excel workbook (e.g., character_generation_schema.xlsx)")
    parser.add_argument("--output-dir", default="json", help="Directory to write JSON files (default: json)")
    args = parser.parse_args()

    export_to_json(args.excel_file, args.output_dir)

if __name__ == "__main__":
    main()
