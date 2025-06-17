# Dashboard

A customizable, retro-themed daily dashboard for productivity, habit tracking, and quick access to your favorite links. Includes CRT-style and dark mode themes, modular widget system, and persistent user settings.

---

## Features

- **Theme Toggle**: Switch between CRT and dark mode, with your preference saved locally.
- **Quick Links Widget**: Add, remove, and manage your favorite links for fast access.
- **Countdown Timer**: Start and reset a visual timer with progress bar for focused work sessions.
- **Modular Widgets**: Easily extendable widget area for future productivity tools.
- **Radar Page**: Includes a dedicated NOAA radar dashboard.

---

## Screenshots

### Dashboard (Dark Theme)
![image1](image1)

### Dashboard (CRT Theme)
![image2](image2)

### Radar (CRT Theme)
![image3](image3)

### Radar (Dark Theme)
![image4](image4)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/S37HCl1F70N/Dashboard.git
cd Dashboard/Dashboard
```

### 2. Open in Browser

Open `dashboard/dashboard.html` or `radar/radar.html` directly in your web browser.

> **No build step required.**  
> All code is static HTML/CSS/JS.

---

## Project Structure

```
Dashboard/
├── base.css            # Global styles and layout
├── base.js             # Theme toggle and shared JS
├── crt-theme.css       # CRT theme styles
├── dark-theme.css      # Dark theme styles
├── responsive.css      # Responsive design rules
├── fonts/              # Custom font assets
│
├── dashboard/
│   ├── dashboard.html  # Main dashboard page
│   └── dashboard.js    # Dashboard widgets logic
│
└── radar/
    ├── radar.html      # NOAA radar dashboard
    └── radar.css       # Radar-specific styles
```

---

## Widget Development

- To add a new widget, create a new `<div class="widget" id="your-widget-id"></div>` in `dashboard.html`.
- Implement interactivity in `dashboard.js`.
- Style your widget in `base.css`, `dark-theme.css`, and/or `crt-theme.css`.

---

## Roadmap

- [ ] Habit tracker widget
- [ ] Weather integration
- [ ] Customizable layout

---

## Contributing

Pull requests are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Adding Your Own Widgets

Widgets are self-contained `<div class="widget">` elements in `dashboard.html`.
- Add your HTML block
- Implement logic in `dashboard.js`
- Style in `base.css` or theme files

See [docs/widgets.md](docs/widgets.md) for more details.

---

## Browser Support

Tested on the latest versions of Chrome, Firefox, and Edge.

---

## Known Issues

- No drag-and-drop widget rearrangement yet.
- No mobile widget collapse (planned).

---

## License

This project is available under the [CC0 1.0 Universal license](LICENSE).  
Use, modify, and redistribute freely.

---

## Credits

- Fonts: [FX_LED](fonts/FX-LED.ttf), [Hack](fonts/Hack-Regular.ttf)
- Inspired by DAKboard and retro terminal dashboards.
