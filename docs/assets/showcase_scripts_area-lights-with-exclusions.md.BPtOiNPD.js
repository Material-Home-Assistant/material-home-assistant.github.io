import{C as a,o as s,c as l,a2 as o,E as r,k as n}from"./chunks/framework.BUrnCmah.js";const d=`alias: 💡 Area lights control with exclusions
description: >-
  Controls (turns on or off) all lights inside a specified area,

  optionally excluding:


  • all entities matching specific labels  

  • or an explicit list of entities (takes priority)


  📌 Parameters:

  - Area: target area to select lights from (required)

  - Operation: turn_off (default) or turn_on (optional)

  - Brightness (%): optional brightness percentage when turning on (keeps the
  previous state if omitted)

  - Transition: fade duration in seconds (optional)

  - Labels to exclude: comma-separated labels (optional)

  - Entities to exclude: manual list of excluded entities (optional)


  🔁 Returns:

  • final list of affected lights
icon: mdi:lightbulb-multiple-outline
mode: single
fields:
  area:
    name: Area
    description: 🏠 Target area to select lights from
    required: true
    selector:
      area: {}
  operation:
    name: Operation
    description: '⚡ Choose whether to turn lights on or off (optional, default: Turn off)'
    required: false
    default: turn_off
    selector:
      select:
        options:
          - label: 🔌 Turn off
            value: turn_off
          - label: 💡 Turn on
            value: turn_on
  brightness_pct:
    name: Brightness (%)
    description: >-
      🔆 Brightness percentage to apply when turning on (optional: if omitted,
      lights turn on at their previous brightness)
    required: false
    selector:
      number:
        min: 1
        max: 100
        unit_of_measurement: '%'
  transition:
    name: Transition (seconds)
    description: ⏱️ Fade transition duration in seconds (optional)
    required: false
    selector:
      number:
        min: 0
        max: 60
        unit_of_measurement: s
  exclude_labels:
    name: Labels to exclude
    description: 🏷️ Comma-separated list of labels to exclude (optional)
    required: false
    selector:
      text:
        multiline: false
  exclude_entities:
    name: Entities to exclude
    description: >-
      🚫 Explicit list of entities to exclude (optional, takes priority over
      labels)
    required: false
    selector:
      entity:
        multiple: true
        filter:
          domain: light
sequence:
  - alias: 🧮 Compute area lights and exclusions
    note: >-
      Filters all light entities belonging to the area, resolves exclusions,
      and builds the final target list
    variables:
      operation_mode: '{{ operation | default(''turn_off'') }}'
      lights_in_area: |
        {{ expand(area_entities(area))
           | selectattr('domain', 'equalto', 'light')
           | map(attribute='entity_id')
           | list }}
      entities_to_exclude: |
        {% if exclude_entities is defined and exclude_entities | count > 0 %}
          {{ exclude_entities }}
        {% elif exclude_labels is defined and exclude_labels | length > 0 %}
          {{ exclude_labels.split(',')
             | map('trim')
             | map('lower')
             | map('label_entities')
             | sum(start=[]) }}
        {% else %}
          []
        {% endif %}
      final_entities: |
        {{ lights_in_area
           | reject('in', entities_to_exclude)
           | list }}
      result:
        area: '{{ area }}'
        operation: '{{ operation_mode }}'
        lights_in_area: '{{ lights_in_area }}'
        excluded_entities: '{{ entities_to_exclude }}'
        affected_entities: '{{ final_entities }}'
        lights_turned_off: '{{ final_entities }}'
  - alias: 🚦 Check target entities and send light command
    note: >-
      Sends the command only if at least one light entity remains after applying
      exclusion filters
    if:
      - alias: 🔍 Check non-empty entity list
        note: >-
          Verifies that the final list of target lights contains at least one
          entity
        condition: template
        value_template: '{{ final_entities | count > 0 }}'
    then:
      - alias: 🔀 Dispatch command by operation
        note: >-
          Selects and executes either turn_on or turn_off based on
          operation_mode
        choose:
          - alias: 💡 Turn on area lights (turn_on)
            note: >-
              Turns on target lights, applying brightness and transition only if
              explicitly provided
            conditions:
              - alias: ⚡ Requested operation equals turn_on
                note: Checks if the requested operation matches turn_on
                condition: template
                value_template: '{{ operation_mode == ''turn_on'' }}'
            sequence:
              - alias: 💡 Send turn_on with optional parameters
                note: >-
                  Calls light.turn_on with the filtered entity list, including
                  brightness_pct and transition only when set
                action: light.turn_on
                target:
                  entity_id: '{{ final_entities }}'
                data: >-
                  {% set b = brightness_pct | int if (brightness_pct is defined
                  and brightness_pct is not none and (brightness_pct | string |
                  trim) != '') else none %} {% set t = transition | int if
                  (transition is defined and transition is not none and
                  (transition | string | trim) != '') else none %} {% if b is
                  not none and t is not none %}
                    {{ {'brightness_pct': b, 'transition': t} }}
                  {% elif b is not none %}
                    {{ {'brightness_pct': b} }}
                  {% elif t is not none %}
                    {{ {'transition': t} }}
                  {% else %}
                    {{ {} }}
                  {% endif %}
          - alias: 🔌 Turn off area lights (turn_off)
            note: >-
              Turns off target lights, applying the optional transition if
              provided
            conditions:
              - alias: ⚡ Requested operation equals turn_off
                note: >-
                  Checks if the requested operation matches turn_off or the
                  default value
                condition: template
                value_template: '{{ operation_mode == ''turn_off'' }}'
            sequence:
              - alias: 🔌 Send turn_off with optional transition
                note: >-
                  Calls light.turn_off with the filtered entity list and the
                  optional transition parameter
                action: light.turn_off
                target:
                  entity_id: '{{ final_entities }}'
                data: >-
                  {% set t = transition | int if (transition is defined and
                  transition is not none and (transition | string | trim) != '')
                  else none %} {% if t is not none %}
                    {{ {'transition': t} }}
                  {% else %}
                    {{ {} }}
                  {% endif %}
  - alias: 🏁 Finish script and return response
    note: >-
      Completes script execution and returns the result object containing the
      list of modified entities
    stop: Script completed
    response_variable: result
`,c=`alias: 💡 Gestione luci area con esclusioni
description: >-
  Gestisce (accende o spegne) tutte le luci presenti in un’area specificata,

  escludendo opzionalmente:


  • tutte le entità associate a determinate label  

  • oppure una lista esplicita di entità (prioritaria)


  📌 Parametri:

  - Area: area da cui selezionare le luci (obbligatoria)

  - Operazione: turn_off (default) oppure turn_on (opzionale)

  - Luminosità (%): percentuale opzionale per l'accensione (se omessa mantiene
  l'ultimo stato)

  - Transizione: durata in secondi per il fade (opzionale)

  - Label da escludere: label separate da virgola (opzionale)

  - Entità da escludere: lista manuale di entità escluse (opzionale)


  🔁 Ritorna:

  • elenco finale delle luci coinvolte
icon: mdi:lightbulb-multiple-outline
mode: single
fields:
  area:
    name: Area
    description: 🏠 Area da cui selezionare le luci
    required: true
    selector:
      area: {}
  operation:
    name: Operazione
    description: '⚡ Scegli se accendere o spegnere le luci (opzionale, default: Spegni)'
    required: false
    default: turn_off
    selector:
      select:
        options:
          - label: 🔌 Spegni
            value: turn_off
          - label: 💡 Accendi
            value: turn_on
  brightness_pct:
    name: Luminosità (%)
    description: >-
      🔆 Percentuale di luminosità da impostare per l'accensione (opzionale: se
      omessa, la lampada si accende al valore precedente)
    required: false
    selector:
      number:
        min: 1
        max: 100
        unit_of_measurement: '%'
  transition:
    name: Transizione (secondi)
    description: ⏱️ Durata del fade di transizione in secondi (opzionale)
    required: false
    selector:
      number:
        min: 0
        max: 60
        unit_of_measurement: s
  exclude_labels:
    name: Label da escludere
    description: 🏷️ Lista di label da escludere separate da virgola (opzionale)
    required: false
    selector:
      text:
        multiline: false
  exclude_entities:
    name: Entità da escludere
    description: >-
      🚫 Lista esplicita di entità da escludere (opzionale, ha priorità sulle
      label)
    required: false
    selector:
      entity:
        multiple: true
        filter:
          domain: light
sequence:
  - alias: 🧮 Calcolo luci area ed esclusioni
    note: >-
      Filtra tutte le entità light appartenenti all'area, calcola le esclusioni
      e genera l'array finale dei target
    variables:
      operation_mode: '{{ operation | default(''turn_off'') }}'
      lights_in_area: |
        {{ expand(area_entities(area))
           | selectattr('domain', 'equalto', 'light')
           | map(attribute='entity_id')
           | list }}
      entities_to_exclude: |
        {% if exclude_entities is defined and exclude_entities | count > 0 %}
          {{ exclude_entities }}
        {% elif exclude_labels is defined and exclude_labels | length > 0 %}
          {{ exclude_labels.split(',')
             | map('trim')
             | map('lower')
             | map('label_entities')
             | sum(start=[]) }}
        {% else %}
          []
        {% endif %}
      final_entities: |
        {{ lights_in_area
           | reject('in', entities_to_exclude)
           | list }}
      result:
        area: '{{ area }}'
        operation: '{{ operation_mode }}'
        lights_in_area: '{{ lights_in_area }}'
        excluded_entities: '{{ entities_to_exclude }}'
        affected_entities: '{{ final_entities }}'
        lights_turned_off: '{{ final_entities }}'
  - alias: 🚦 Verifica presenza entità e comando luci
    note: >-
      Procede all'invio del comando solo se rimane almeno un'entità luce da
      comandare dopo i filtri di esclusione
    if:
      - alias: 🔍 Controllo lista entità non vuota
        note: >-
          Verifica che la lista finale delle luci da gestire contenga almeno un
          elemento
        condition: template
        value_template: '{{ final_entities | count > 0 }}'
    then:
      - alias: 🔀 Smistamento comando in base all'operazione
        note: >-
          Seleziona ed esegue il comando di accensione o spegnimento in base al
          parametro operation_mode
        choose:
          - alias: 💡 Accensione luci area (turn_on)
            note: >-
              Esegue l'accensione delle luci target applicando luminosità e
              transizione solo se esplicitamente definite
            conditions:
              - alias: ⚡ Operazione richiesta uguale a turn_on
                note: Verifica se l'operazione specificata corrisponde a turn_on
                condition: template
                value_template: '{{ operation_mode == ''turn_on'' }}'
            sequence:
              - alias: 💡 Invio comando turn_on con parametri opzionali
                note: >-
                  Chiama light.turn_on passando la lista delle entità filtrate e
                  includendo brightness_pct e transition solo se valorizzati
                action: light.turn_on
                target:
                  entity_id: '{{ final_entities }}'
                data: >-
                  {% set b = brightness_pct | int if (brightness_pct is defined
                  and brightness_pct is not none and (brightness_pct | string |
                  trim) != '') else none %} {% set t = transition | int if
                  (transition is defined and transition is not none and
                  (transition | string | trim) != '') else none %} {% if b is
                  not none and t is not none %}
                    {{ {'brightness_pct': b, 'transition': t} }}
                  {% elif b is not none %}
                    {{ {'brightness_pct': b} }}
                  {% elif t is not none %}
                    {{ {'transition': t} }}
                  {% else %}
                    {{ {} }}
                  {% endif %}
          - alias: 🔌 Spegnimento luci area (turn_off)
            note: >-
              Esegue lo spegnimento delle luci target applicando l'eventuale
              transizione opzionale
            conditions:
              - alias: ⚡ Operazione richiesta uguale a turn_off
                note: >-
                  Verifica se l'operazione specificata corrisponde a turn_off o
                  al valore di default
                condition: template
                value_template: '{{ operation_mode == ''turn_off'' }}'
            sequence:
              - alias: 🔌 Invio comando turn_off con transizione opzionale
                note: >-
                  Chiama light.turn_off passando la lista delle entità filtrate
                  e l'eventuale parametro transition
                action: light.turn_off
                target:
                  entity_id: '{{ final_entities }}'
                data: >-
                  {% set t = transition | int if (transition is defined and
                  transition is not none and (transition | string | trim) != '')
                  else none %} {% if t is not none %}
                    {{ {'transition': t} }}
                  {% else %}
                    {{ {} }}
                  {% endif %}
  - alias: 🏁 Chiusura script e restituzione dati
    note: >-
      Conclude l'esecuzione dello script restituendo l'oggetto result contenente
      l'elenco delle entità modificate
    stop: Script completato
    response_variable: result
`,t={en:d,it:c},g=JSON.parse('{"title":"Area Lights with Exclusions","description":"Home Assistant script to turn on or off all lights in an area while excluding specific entities or labels.","frontmatter":{"title":"Area Lights with Exclusions","description":"Home Assistant script to turn on or off all lights in an area while excluding specific entities or labels."},"headers":[],"relativePath":"showcase/scripts/area-lights-with-exclusions.md","filePath":"showcase/scripts/area-lights-with-exclusions.md"}'),u={name:"showcase/scripts/area-lights-with-exclusions.md"},_=Object.assign(u,{setup(p){return(f,e)=>{const i=a("MultiLangYaml");return s(),l("div",null,[e[0]||(e[0]=o(`<h1 id="💡-area-lights-with-exclusions" tabindex="-1">💡 Area Lights with Exclusions <a class="header-anchor" href="#💡-area-lights-with-exclusions" aria-label="Permalink to &quot;💡 Area Lights with Exclusions&quot;">​</a></h1><p>Controls all <code>light</code> entities inside a target Home Assistant area (<code>turn_on</code> or <code>turn_off</code>), with optional exclusions by entity or label, optional brightness and transition, and a response payload listing the affected lights.</p><h2 id="⚙️-parameters" tabindex="-1">⚙️ Parameters <a class="header-anchor" href="#⚙️-parameters" aria-label="Permalink to &quot;⚙️ Parameters&quot;">​</a></h2><table tabindex="0"><thead><tr><th style="text-align:left;">Field</th><th style="text-align:left;">Selector</th><th style="text-align:left;">Required</th><th style="text-align:left;">Default</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>area</code></td><td style="text-align:left;"><code>area</code></td><td style="text-align:left;">Yes</td><td style="text-align:left;"></td><td style="text-align:left;">Target area to pull <code>light</code> entities from.</td></tr><tr><td style="text-align:left;"><code>operation</code></td><td style="text-align:left;"><code>select</code></td><td style="text-align:left;">No</td><td style="text-align:left;"><code>turn_off</code></td><td style="text-align:left;">Action to perform (<code>turn_off</code> or <code>turn_on</code>).</td></tr><tr><td style="text-align:left;"><code>brightness_pct</code></td><td style="text-align:left;"><code>number</code></td><td style="text-align:left;">No</td><td style="text-align:left;"></td><td style="text-align:left;">Brightness percentage (<code>1</code> to <code>100</code>) when turning lights on.</td></tr><tr><td style="text-align:left;"><code>transition</code></td><td style="text-align:left;"><code>number</code></td><td style="text-align:left;">No</td><td style="text-align:left;"></td><td style="text-align:left;">Fade duration in seconds (<code>0</code> to <code>60</code>).</td></tr><tr><td style="text-align:left;"><code>exclude_labels</code></td><td style="text-align:left;"><code>text</code></td><td style="text-align:left;">No</td><td style="text-align:left;"></td><td style="text-align:left;">Comma-separated label names whose entities should be skipped.</td></tr><tr><td style="text-align:left;"><code>exclude_entities</code></td><td style="text-align:left;"><code>entity</code></td><td style="text-align:left;">No</td><td style="text-align:left;"></td><td style="text-align:left;">Explicit list of <code>light</code> entities to skip (takes priority over labels).</td></tr></tbody></table><h2 id="🔍-how-it-works" tabindex="-1">🔍 How It Works <a class="header-anchor" href="#🔍-how-it-works" aria-label="Permalink to &quot;🔍 How It Works&quot;">​</a></h2><ol><li>Expands all entities in <code>area</code> and keeps only the <code>light</code> domain.</li><li>Resolves exclusions: if <code>exclude_entities</code> is non-empty, it is used directly; otherwise, <code>exclude_labels</code> is split by comma and resolved via <code>label_entities</code>.</li><li>Only calls <code>light.turn_on</code> or <code>light.turn_off</code> if at least one target light remains after filtering, passing <code>brightness_pct</code> and <code>transition</code> only when provided.</li><li>Ends with <code>response_variable: result</code>, returning <code>area</code>, <code>operation</code>, <code>lights_in_area</code>, <code>excluded_entities</code>, <code>affected_entities</code>, and <code>lights_turned_off</code>.</li></ol><h2 id="🧪-example-call" tabindex="-1">🧪 Example Call <a class="header-anchor" href="#🧪-example-call" aria-label="Permalink to &quot;🧪 Example Call&quot;">​</a></h2><div class="language-yaml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">action</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">script.area_lights_control_with_exclusions</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  area</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">living_room</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  operation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">turn_off</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  transition</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  exclude_labels</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">always_on, night_light</span></span></code></pre></div><h2 id="📜-full-script-yaml" tabindex="-1">📜 Full Script YAML <a class="header-anchor" href="#📜-full-script-yaml" aria-label="Permalink to &quot;📜 Full Script YAML&quot;">​</a></h2><div class="info custom-block"><p class="custom-block-title">Import in Home Assistant</p><p>Go to <strong>Settings -&gt; Automations &amp; Scenes -&gt; Scripts -&gt; Add Script -&gt; Edit in YAML</strong> and paste the configuration below. Use the language selector to switch between English and Italian.</p></div>`,10)),r(i,{title:"Area Lights with Exclusions",en:n(t).en,it:n(t).it,"default-lang":"en"},null,8,["en","it"])])}}});export{g as __pageData,_ as default};
