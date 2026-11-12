import{C as r,o as n,c,j as t,a as o,E as i,k as s,a2 as d}from"./chunks/framework.BUrnCmah.js";const h=[{id:"header",title:"Material Header",badge:"Header",description:"Top bar with search and user profile menu. This card only needs to be added to the main screen, then it is applied automatically across all views.",docLink:"/cards/material-header",docLabel:"Material Header Docs",images:["/assets/img/Material Home Component/Material%20Header/Material%20Header%20Dark.png"],x:63.3,y:.4,width:36.6,height:5.8,code:`type: custom:material-header
icon: mdi:star-four-points
show_search: true
show_user: true
search_behavior: search`},{id:"quick-dashboard",title:"Material Dashboard",badge:"Dashboard",description:"Overview card with quick links to Cameras, Lighting, Wi-Fi, and Climate.",notes:"Replace all placeholder values inside `<...>` (such as `<energy-panel-path>` or `<lighting-page-path>`) with your own dashboard view paths. You can edit them directly in the YAML configurator or through the Home Assistant Visual UI Editor.",docLink:"/cards/material-dashboard-card",docLabel:"Material Dashboard Card Docs",images:["/assets/img/Material Home Component/Material%20Dashboard/Material%20Dashboard%20Dark.png"],x:6,y:13,width:46.7,height:21.6,codes:[{label:"Section Title",code:`type: heading
icon: m3r:category
heading: Categorie
heading_style: title
grid_options:
  columns: full
  rows: auto
`},{label:"Card Configuration",code:`type: custom:material-dashboard-card
custom_sections:
  - name: Energia
    label: Consumi
    icon: m3r:energy-savings-leaf
    color: |
      [[[
        return hass.themes.darkMode ? '#C5E1A5' : '#558B2F';
      ]]]
    background_color: |
      [[[
        return hass.themes.darkMode ? '#243320' : '#F1F8E9';
      ]]]
    path: <energy-panel-path>
    hidden: false
  - name: Media Player
    label: |
      [[[
          const devices = Object.keys(hass.states).filter((e) =>
          e.startsWith("media_player.") &&
          hass.entities[e] &&
          !hass.entities[e].hidden
        ).length;
        return devices > 1 ? devices + " " + "Speakers" : devices + " " + "Speaker";
      ]]]
    icon: m3r:speaker-group
    color: |
      [[[
        return hass.themes.darkMode ? '#81D4FA' : '#0288D1';
      ]]]
    background_color: |
      [[[
        return hass.themes.darkMode ? '#1A2C3E' : '#E1F5FE';
      ]]]
    path: <media-player-page-path>
    hidden: false
use_default_icon: true
lighting: <lighting-page-path>
climate: <climate-page-path>
wifi: <wifi-page-path>
triggers_update: all
default_action: true
action_type: hold_action
web: true
single_tap_web: true
cameras: <cameras-page-path>
grid_options:
  columns: full
`}]},{id:"areas",title:"Material Strategy Card - Areas",badge:"Areas",description:"Overview of different areas in the home with quick access to their controls.",notes:"Replace all placeholder values inside `<...>` under `area_pages` (such as `<bathroom-page-path>` or `<living-room-page-path>`) with your own area view paths. You can edit them directly in the YAML configurator or through the Home Assistant Visual UI Editor.",docLabel:"Material Areas Card Docs",x:6,y:36,width:58.4,height:28.6,code:`type: custom:material-strategy-card
section: areas
area_config:
  area_pages:
    bagno: <bathroom-page-path>
    camera_da_letto: <camera-page-path>
    cucina: <kitchen-page-path>
    ingresso: <entrance-page-path>
    soggiorno: <living-room-page-path>
    ufficio: <office-page-path>
  show_section: true
  show_section_title: true
  show_temperature_and_humidity: true
  show_bottom_space: false
  section_icon: m3r:meeting-room
  show_color_on_area: true
  section_title: Stanze
  skip_active_entities:
    - binary_sensor.dish_washer_door_status
  section_path: /config/areas/dashboard
grid_options:
  columns: full
`}],l=[{id:"room-section-1",title:"Section 1",badge:"Column 1",description:"Includes: Lights, Covers, Climate, and Media. Powered by Material Strategy Card, entities are detected automatically from the selected room and any missing category is hidden automatically to save space.",notes:["Create a new section in your Home Assistant Sections view, open its YAML code editor, replace every `<...>` placeholder (`<area-id>`, `<primary-light-entity>`, `<lighting-page-path>`, `<climate-page-path>`, `<media-player-page-path>`), and paste the snippet.","To exclude specific entities from appearing in a room, create a Home Assistant label named `hidden` (matching `hidden_label: hidden`) and assign it to those entities.","Once pasted, you can freely drag and reorder cards across sections in the UI editor. Dedicated Material Strategy Card documentation is coming soon."],docLabel:"Material Strategy Card Docs (Coming Soon)",x:6.2,y:9,width:28.6,height:75.5,code:`type: grid
cards:
  - type: custom:material-strategy-card
    section: lights
    lights_config:
      show_section: true
      show_section_title: true
      section_title: Illuminazione
      section_icon: m3r:light-group
      show_bottom_space: true
      section_path: <lighting-page-path>
      show_lights_card: true
      primary_entity: <primary-light-entity>
      hidden_label: hidden
      name_mode: auto
      cards_config:
        show_percentage: true
        show_state: true
    area: <area-id>
  - type: custom:material-strategy-card
    section: cover
    covers_config:
      show_section: true
      show_section_title: true
      section_title: Oscuramento
      section_icon: m3r:window-open
      show_bottom_space: true
      hidden_label: hidden
      name_mode: auto
      cards_config:
        show_percentage: true
        show_state: true
    area: <area-id>
  - type: custom:material-strategy-card
    section: climate
    area: <area-id>
    climate_config:
      show_section: true
      show_section_title: true
      section_title: Comfort Ambientale
      section_icon: m3r:nest-thermostat-e-eu
      show_bottom_space: true
      show_extended_cards: true
      section_path: <climate-page-path>
      hidden_label: hidden
      name_mode: auto
      cards_config: {}
      sensor_card_type: template
      sensor_cards_config:
        show_shavron_icon: true
  - type: custom:material-strategy-card
    section: media
    area: <area-id>
    media_config:
      show_section: true
      show_section_title: true
      section_title: Multimedia
      section_icon: m3r:connected-tv
      show_bottom_space: true
      show_extended_cards_on_play: true
      section_path: <media-player-page-path>
      hidden_label: hidden
      name_mode: auto
      cards_config:
        settings:
          show_name: true
          show_dynamic_icon: true
          show_app_icon: true
          show_cover: true
          show_time: true
          show_cast_volume: true
          show_tv_volume: true
          show_power: true
          show_cast: true
          show_remote: true
          remote_mode: dialog
          show_old_dialog: true`},{id:"room-section-2",title:"Section 2",badge:"Column 2",description:"Includes: Security, Controls, Vacuums, Switches, Infrastructure, Buttons, Energy, Sensors, and Devices. Powered by Material Strategy Card, categories with no matching entities in the room collapse automatically.",notes:["Replace `<area-id>`, `<security-page-path>`, and `<energy-panel-path>` with your room area ID and dashboard paths before saving the section YAML.","Assign the `hidden` label in Home Assistant to hide noisy diagnostic entities while keeping `hidden_label: hidden` intact."],docLabel:"Material Strategy Card Docs (Coming Soon)",x:35.6,y:9,width:28.8,height:71.5,code:`type: grid
cards:
  - type: custom:material-strategy-card
    section: security
    area: <area-id>
    security_config:
      show_section: true
      show_section_title: true
      section_title: Sicurezza e Accessi
      section_icon: m3r:shield-lock
      show_extended_cards: true
      show_bottom_space: true
      section_path: <security-page-path>
      hidden_label: hidden
      name_mode: auto
      cards_config:
        show_shavron_icon: true
      settings:
        show_keypad: true
        show_old_dialog: true
        show_camera_on_panel: true
        cameras: []
        show_camera_on_disarmed: true
  - type: custom:material-strategy-card
    section: controls
    area: <area-id>
    controls_config:
      show_section: true
      show_section_title: true
      section_title: Regolazioni
      section_icon: m3o:handyman
      show_bottom_space: true
      hidden_label: hidden
      name_mode: auto
      cards_config:
        show_shavron_icon: true
  - type: custom:material-strategy-card
    section: vacuums
    area: <area-id>
    vacuums_config:
      show_section: true
      show_section_title: true
      section_title: Pulizia
      section_icon: m3r:vacuum
      show_bottom_space: true
      hidden_label: hidden
      name_mode: auto
      cards_config:
        show_shavron_icon: true
  - type: custom:material-strategy-card
    section: switches
    area: <area-id>
    switches_config:
      show_section: true
      show_section_title: true
      section_title: Interruttori e Prese
      section_icon: m3r:switch
      show_bottom_space: true
      hidden_label: hidden
      name_mode: auto
      cards_config:
        show_shavron_icon: false
  - type: custom:material-strategy-card
    section: infrastructure
    area: <area-id>
    infrastructure_config:
      show_section: true
      show_section_title: true
      section_title: Infrastruttura
      section_icon: mdi:server-network-outline
      show_bottom_space: true
      hidden_label: hidden
      name_mode: auto
      cards_config:
        show_shavron_icon: true
  - type: custom:material-strategy-card
    section: buttons
    area: <area-id>
    buttons_config:
      show_section: true
      show_section_title: true
      section_title: Controlli Dispositivo
      section_icon: m3rf:left-click
      show_bottom_space: true
      hidden_label: hidden
      name_mode: auto
      cards_config:
        show_shavron_icon: true
  - type: custom:material-strategy-card
    section: energy
    area: <area-id>
    energy_config:
      show_section: true
      show_section_title: true
      section_title: Energia e Consumi
      section_icon: m3r:energy-savings-leaf
      show_bottom_space: true
      section_path: <energy-panel-path>
      hidden_label: hidden
      card_type: graph
      cards_config:
        default_color: true
        low_battery_color: true
        low_battery_level: 15
        hours_to_show: 24
        show_shavron_icon: true
        max_height: 40
      graph_device_classes:
        - battery
      name_mode: friendly_name
  - type: custom:material-strategy-card
    section: sensor
    area: <area-id>
    sensors_config:
      show_section: true
      show_section_title: true
      section_title: Informazioni Ambiente
      section_icon: mdi:information-outline
      show_bottom_space: true
      hidden_label: hidden
      name_mode: auto
      cards_config:
        show_shavron_icon: true
  - type: custom:material-strategy-card
    section: device
    area: <area-id>
    devices_config:
      show_section: true
      show_section_title: true
      section_title: Dispositivi e Sensori
      section_icon: m3r:devices-other
      show_bottom_space: true
      hidden_label: hidden
      name_mode: auto
      cards_config:
        show_shavron_icon: true`},{id:"room-section-3",title:"Section 3",badge:"Column 3",description:"Includes: Events and Actions. Powered by Material Strategy Card, displays room button and switch interactions alongside linked automations and scripts.",notes:["Replace `<area-id>` and `<automation-page-path>` with your room area ID and automations view path.","Entities tagged with the `hidden` label in Home Assistant are excluded automatically."],docLabel:"Material Strategy Card Docs (Coming Soon)",x:65.2,y:9,width:28.8,height:57.5,code:`type: grid
cards:
  - type: custom:material-strategy-card
    section: events
    area: <area-id>
    events_config:
      show_section: true
      show_section_title: true
      section_title: Interazioni e Pulsanti
      section_icon: m3r:event-list
      show_bottom_space: true
      hidden_label: hidden
      name_mode: auto
      cards_config:
        show_shavron_icon: true
  - type: custom:material-strategy-card
    section: actions
    area: <area-id>
    actions_config:
      show_section: true
      show_section_title: true
      section_title: Azioni e Scenari
      section_icon: m3o:automation
      show_bottom_space: false
      show_status_text: true
      show_last_triggered: true
      section_path: <automation-page-path>
      hidden_label: hidden
      name_mode: auto
      cards_config: {}`}],p=JSON.parse('{"title":"UI Configuration","description":"Interactive views of my Home Assistant desktop dashboard built with Material Home Assistant, covering both the main home screen and individual room views.","frontmatter":{"title":"UI Configuration","description":"Interactive views of my Home Assistant desktop dashboard built with Material Home Assistant, covering both the main home screen and individual room views."},"headers":[],"relativePath":"showcase/ui-configuration.md","filePath":"showcase/ui-configuration.md"}'),_={name:"showcase/ui-configuration.md"},w=Object.assign(_,{setup(m){return(u,e)=>{const a=r("InteractiveUIViewer");return n(),c("div",null,[e[0]||(e[0]=t("h1",{id:"🖥️-ui-configuration",tabindex:"-1"},[o("🖥️ UI Configuration "),t("a",{class:"header-anchor",href:"#🖥️-ui-configuration","aria-label":'Permalink to "🖥️ UI Configuration"'},"​")],-1)),e[1]||(e[1]=t("p",null,"These are the core Home Assistant desktop views in my setup. Click any highlighted area on the screenshots, or use the pills below each preview, to inspect and copy its YAML configuration.",-1)),e[2]||(e[2]=t("h2",{id:"🏠-main-home-view",tabindex:"-1"},[o("🏠 Main Home View "),t("a",{class:"header-anchor",href:"#🏠-main-home-view","aria-label":'Permalink to "🏠 Main Home View"'},"​")],-1)),i(a,{title:"Home Dashboard",subtitle:"Click any section on the screenshot to view its YAML configuration",image:"/assets/img/showcase/dashboard.png",alt:"Material Home Assistant Desktop Dashboard",sections:s(h),layout:"stacked"},null,8,["sections"]),e[3]||(e[3]=d('<h2 id="🛏️-room-view" tabindex="-1">🛏️ Room View <a class="header-anchor" href="#🛏️-room-view" aria-label="Permalink to &quot;🛏️ Room View&quot;">​</a></h2><p>Each room page is organized into <strong>3 grid sections</strong> powered by the <strong>Material Strategy Card</strong> (dedicated documentation for this card is coming soon). Instead of adding entities manually one by one, each block reads the configured <code>area</code> and populates its cards automatically.</p><ul><li><strong>Quick import:</strong> create a section in your Home Assistant view, open its <strong>Code Editor</strong>, replace every <code>&lt;...&gt;</code> placeholder (such as <code>&lt;area-id&gt;</code>, <code>&lt;primary-light-entity&gt;</code>, and view paths) with your own values, and paste the YAML block. Once imported, you can freely reorder or move cards between sections.</li><li><strong>Hide unwanted entities:</strong> create a Home Assistant label named <code>hidden</code> (matching <code>hidden_label: hidden</code> in the YAML) and assign it to any entity you do not want displayed in the room.</li><li><strong>Automatic empty-state hiding:</strong> if a room does not have entities for one of the configured categories (for example, no covers or vacuums in a bedroom), that block is hidden automatically to avoid empty space.</li></ul>',3)),i(a,{title:"Room Dashboard",subtitle:"Click any of the 3 columns to copy its Strategy Card grid YAML",image:"/assets/img/showcase/rooms.png",alt:"Material Home Assistant Room View",sections:s(l),layout:"stacked"},null,8,["sections"])])}}});export{p as __pageData,w as default};
