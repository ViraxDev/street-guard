import { Controller } from '@hotwired/stimulus'

// A single, shared promise to ensure Mapbox GL JS/CSS is loaded once
let mapboxLoadingPromise = null
function ensureMapboxLoaded() {
  if (window.mapboxgl && typeof window.mapboxgl.Map === 'function') {
    return Promise.resolve()
  }
  if (mapboxLoadingPromise) return mapboxLoadingPromise
  mapboxLoadingPromise = new Promise((resolve) => {
    const head = document.head || document.getElementsByTagName('head')[0]
    // CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css'
    head.appendChild(link)
    // JS
    const script = document.createElement('script')
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js'
    script.async = true
    script.onload = () => resolve()
    head.appendChild(script)
  })
  return mapboxLoadingPromise
}

export default class extends Controller {
  static values = {
    token: String,
    mode: { type: String, default: 'card' }, // 'card' | 'full'
    zoom: Number,
    pitch: Number,
    bearing: Number,
    lat: Number,
    lng: Number,
  }

  async connect() {
    // Prevent double-init
    if (this.element.__streetGuardMapInited) return
    this.element.__streetGuardMapInited = true

    await ensureMapboxLoaded()

    const token = this.resolveToken()
    if (!token) {
      console.warn('[StreetGuard] Mapbox token is missing for map container.', this.element)
      this.element.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:12px;">Mapbox token manquant. Veuillez configurer MAPBOX_TOKEN.</div>'
      return
    }

    window.mapboxgl.accessToken = token

    const mode = this.modeValue
    const defaults = this.defaultsForMode(mode)

    this.map = new window.mapboxgl.Map({
      container: this.element,
      style: 'mapbox://styles/mapbox/standard',
      center: this.latValue && this.lngValue ? [this.latValue, this.lngValue] : [defaults.lat, defaults.lng],
      zoom: Number.isFinite(this.zoomValue) ? this.zoomValue : defaults.zoom,
      pitch: Number.isFinite(this.pitchValue) ? this.pitchValue : defaults.pitch,
      bearing: Number.isFinite(this.bearingValue) ? this.bearingValue : defaults.bearing,
      antialias: true
    })

    // Controls
    this.map.addControl(new window.mapboxgl.NavigationControl(), 'top-right')
    this.map.addControl(new window.mapboxgl.ScaleControl({ maxWidth: mode === 'full' ? 140 : 120, unit: 'metric' }))
    if (mode === 'full') {
      this.map.addControl(new window.mapboxgl.FullscreenControl())
    }

    this.map.on('style.load', () => {
      // Config properties (try/catch for style compatibility)
      try {
        this.map.setConfigProperty('basemap', 'lightPreset', 'dusk')
        this.map.setConfigProperty('basemap', 'show3dObjects', true)
        this.map.setConfigProperty('basemap', 'showPointOfInterestLabels', true)
      } catch (e) {}

      try {
        this.map.setFog({
          range: [-1, 2],
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'space-color': 'rgb(11, 11, 25)',
          'horizon-blend': 0.02
        })
      } catch (e) {}

      const alerts = [
        { level: 'high',   color: '#fb7185', outline: 'rgba(251,113,133,0.35)',  lngLat: [-0.1246, 51.5007], label: 'High Alert — Big Ben (Westminster)' },
        { level: 'medium', color: '#fcd34d', outline: 'rgba(252,211,77,0.35)',   lngLat: [-0.1195, 51.5033], label: 'Medium Alert — London Eye' },
        { level: 'low',    color: '#34d399', outline: 'rgba(52,211,153,0.35)',   lngLat: [-0.1269, 51.5194], label: 'Low Alert — British Museum' }
      ]

      // Marker size differs based on mode
      const markerSize = mode === 'full' ? 12 : 10
      alerts.forEach(a => {
        const el = document.createElement('div')
        el.style.width = markerSize + 'px'
        el.style.height = markerSize + 'px'
        el.style.background = a.color
        el.style.borderRadius = '9999px'
        el.style.boxShadow = `0 0 0 3px ${a.outline}`
        new window.mapboxgl.Marker(el)
          .setLngLat(a.lngLat)
          .setPopup(new window.mapboxgl.Popup({ offset: 12 }).setText(a.label))
          .addTo(this.map)
      })

      // Zones
      const alertsSource = {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: alerts.map(a => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: a.lngLat },
            properties: { level: a.level }
          }))
        }
      }
      if (!this.map.getSource('alerts')) this.map.addSource('alerts', alertsSource)

      const radiusHigh   = ['interpolate', ['linear'], ['zoom'], 10, 40, 12, 110, 14, 220, 16, 400]
      const radiusMedium = ['interpolate', ['linear'], ['zoom'], 10, 30, 12, 90,  14, 180, 16, 320]
      const radiusLow    = ['interpolate', ['linear'], ['zoom'], 10, 22, 12, 70,  14, 150, 16, 260]

      const addZoneLayer = (id, level, color) => {
        if (this.map.getLayer(id)) return
        this.map.addLayer({
          id,
          type: 'circle',
          source: 'alerts',
          filter: ['==', ['get', 'level'], level],
          paint: {
            'circle-color': color,
            'circle-opacity': 0.28,
            'circle-blur': 0.5,
            'circle-stroke-color': color,
            'circle-stroke-opacity': 0.45,
            'circle-stroke-width': 1,
            'circle-radius': level === 'high' ? radiusHigh : (level === 'medium' ? radiusMedium : radiusLow)
          }
        })
      }

      addZoneLayer('alerts-zones-high',   'high',   'rgba(251,113,133,0.45)')
      addZoneLayer('alerts-zones-medium', 'medium', 'rgba(252,211,77,0.45)')
      addZoneLayer('alerts-zones-low',    'low',    'rgba(52,211,153,0.45)')

      // Accessibility
      this.element.setAttribute('role', 'region')
      this.element.setAttribute('aria-label', mode === 'full'
        ? 'Interactive full-screen map showing high-risk zones and alerts'
        : 'Interactive map showing high-risk zones with recent incident reports')
    })
  }

  disconnect() {
    try {
      if (this.map) {
        this.map.remove()
      }
    } catch (e) {}
  }

  resolveToken() {
    // Priority: explicit value -> window -> meta -> data attribute (backwards-compat)
    if (this.hasTokenValue && this.tokenValue) return this.tokenValue
    if (window.MAPBOX_TOKEN) return window.MAPBOX_TOKEN
    const meta = document.querySelector('meta[name="mapbox-token"]')
    if (meta) return meta.getAttribute('content')
    const attr = this.element.getAttribute('data-mapbox-token')
    return attr || ''
  }

  defaultsForMode(mode) {
    if (mode === 'full') {
      return {
        center: [-0.1276, 51.5074], // London
        zoom: 13,
        pitch: 45,
        bearing: -17.6,
        lat: -0.1276,
        lng: 51.5074,
      }
    }
    // card (default)
    return {
      zoom: 12,
      pitch: 45,
      bearing: -17.6,
      lat: -0.1276,
      lng: 51.5074,
    }
  }
}
