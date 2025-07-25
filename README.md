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
![image](https://github.com/user-attachments/assets/51623de7-3a8d-4325-989b-c0737ef78d88)


### Dashboard (CRT Theme)
![image](https://github.com/user-attachments/assets/efd12b8e-03ef-4a40-935f-66d7eb36b00a)


### Radar (CRT Theme)
![image](https://github.com/user-attachments/assets/d148b4bd-c12e-46a7-9d78-b4f9a7327b76)


### Radar (Dark Theme)
![image](https://github.com/user-attachments/assets/39140e8e-82e8-49b4-a97e-eccfc1a498f8)


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
├── css/
│   ├── base.css
│   ├── dashboard.css
│   ├── radar.css
│   ├── sudoku.css
│   ├── responsive.css
│   └── themes/
│       ├── crt-theme.css
│       └── dark-theme.css
├── html/
│   ├── dashboard.html
│   ├── radar.html
│   └── sudoku.html
├── js/
│   ├── base.js
│   ├── dashboard.js
│   ├── radar.js
│   └── sudoku.js
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

- Inspired by DAKboard and retro terminal dashboards.
