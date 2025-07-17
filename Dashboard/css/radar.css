html.radar-page, body.radar-page {
  margin: 0;
  padding: 0;
  height: auto;
  min-height: 100%;
  overflow-y: auto;
  font-family: "Hack", sans-serif;
}

.radar-page .grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  height: calc(100vh - 110px);
  gap: 6px;
  padding: 6px;
  box-sizing: border-box;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  font-family: sans-serif;
  font-size: 1rem;
}

#clock-bar {
  padding: 5px 10px;
  font-size: 1rem;
  text-align: center;
}

#current-conditions {
  display: flex;
  gap: 15px;
  align-items: center;
  white-space: nowrap;
}

.alert-bar, .forecast-bar {
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  font-size: 0.9rem;
  padding: 4px 0;
  border-top: 1px dashed;
  border-bottom: 1px dashed;
  box-shadow: 0 0 8px;
}

.timestamp {
  position: absolute;
  right: 10px;
  top: 2px;
  font-size: 0.8rem;
}

.scrolling-text {
  display: inline-block;
  white-space: nowrap;
  will-change: transform;
  animation: scroll-left linear infinite;
  padding-left: 100%;
}

@keyframes scroll-left {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

.radar-page .zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border: 1px solid;
  padding: 6px;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-radius: 0.5rem;
}

.radar-page .zone-title {
  font-weight: bold;
  margin-bottom: 0.3rem;
  text-align: center;
  font-family: "Hack-Bold", sans-serif;
  border-bottom: 1px dashed;
  width: 100%;
}

.radar-page .zone img {
  width: 100%;
  height: auto;
  max-height: 85%;
  object-fit: contain;
  flex-grow: 1;
  border-radius: 0.5rem;
  display: block;
}

.radar-page .zone .button {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  padding: 4px 10px;
  border: 1px dashed;
  background: transparent;
  font-family: 'Courier New', Courier, monospace;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.radar-embed-container {
  display: block;
  width: 100%;
  height: 600px; /* Adjust height as desired */
  margin-top: 2rem;
  padding-bottom: 2rem;
  overflow: hidden;
  border-radius: 1rem;
  box-shadow: 0 0 12px rgb(183, 0, 255);
  position: relative;
  z-index: 0;
}

.radar-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
