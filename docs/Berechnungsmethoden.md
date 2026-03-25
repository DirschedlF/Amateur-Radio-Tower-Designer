# Berechnungsmethoden

Dieses Dokument beschreibt die physikalischen Grundlagen, Formeln und Annahmen der beiden Rechner im Amateur Radio Tower Designer.

---

## 1. Guy Wire Calculator — Abspanngeometrie

### 1.1 Methode

Die Abspanngeometrie wird rein trigonometrisch berechnet. Jeder Abspanndraht bildet zusammen mit dem Mast und dem Boden ein rechtwinkliges Dreieck: die Gegenkathete ist die Befestigungshöhe am Mast, die Ankathete der horizontale Abstand vom Mastfuß zum Erdanker (Ankerradius).

### 1.2 Eingaben

| Größe | Symbol | Einheit | Beschreibung |
|-------|--------|---------|--------------|
| Masthöhe | H | m | Gesamthöhe des Mastes (Eingabe, für zukünftige Validierung) |
| Befestigungshöhe | h | m | Höhe des Abspannpunktes am Mast |
| Ankerradius | r | m | Horizontaler Abstand vom Mastfuß zum Erdanker |
| Drahtanzahl | n | — | Anzahl gleichmäßig verteilter Drähte je Ebene (3 oder 4) |

### 1.3 Berechnungen

**Drahtlänge** (Pythagoras):

```
L = √(h² + r²)
```

**Winkel von der Horizontalen** (Neigungswinkel des Drahtes):

```
α = arctan(h / r)    [in Grad]
```

**Winkel vom Mast** (Komplementärwinkel):

```
β = 90° − α
```

**Gesamtlänge je Ebene:**

```
L_Ebene = L × n
```

**Gesamtlänge aller Ebenen:**

```
L_gesamt = Σ L_Ebene
```

### 1.4 Annahmen

- Der Mast steht senkrecht; alle Drähte einer Ebene haben dieselbe Länge.
- Der Erdanker liegt auf Bodenniveau (z = 0).
- Drähte hängen gerade (kein Durchhang, keine Seildehnung).
- Die Drähte einer Ebene sind gleichmäßig über den Umfang verteilt (für die Geometrieberechnung ohne Bedeutung, für die Lastberechnung relevant).

---

## 2. Wind Load Calculator — Windlastberechnung

### 2.1 Methode

Die Windlastberechnung folgt dem vereinfachten Ansatz der **EN 1991-1-4** (Einwirkungen auf Tragwerke — Windlasten). Der Mast wird als konischer Körper (Kegelstumpf) mit linear veränderlichem Durchmesser modelliert. Die Antenne wird als punktförmige Last an einer definierten Montagehöhe behandelt.

### 2.2 Eingaben

| Größe | Symbol | Einheit | Beschreibung |
|-------|--------|---------|--------------|
| Windgeschwindigkeit | v | m/s | Mittlere Windgeschwindigkeit |
| Böenfaktor | c_f | — | Multiplikator auf den Staudruck (Standard: 1,7) |
| Masthöhe | H | m | Gesamthöhe des Mastes |
| Durchmesser unten | d_u | mm | Außendurchmesser am Mastfuß |
| Durchmesser oben | d_o | mm | Außendurchmesser an der Mastspitze |
| Widerstandsbeiwert Mast | c_w | — | Aerodynamischer Beiwert (Standard: 1,1 für Stahlrohr) |
| Antennenfläche | A_A | m² | Projizierte Windangriffsfläche der Antenne |
| Widerstandsbeiwert Antenne | c_w,A | — | Aerodynamischer Beiwert der Antenne |
| Montagehöhe Antenne | h_A | m | Höhe des aerodynamischen Schwerpunkts der Antenne |

### 2.3 Berechnungen

**Staudruck** (mit Böenfaktor):

```
q = 0,5 × ρ × v² × c_f
```

mit Luftdichte ρ = 1,25 kg/m³.

**Windkraft auf den Mast** (Trapezfläche des Kegelstumpfs):

```
A_Mast = (d_u + d_o) / 2 × H
F_Mast = q × c_w × A_Mast
```

**Hebelarm der Mastkraft** (Schwerpunkt der Trapezfläche):

```
z_Mast = H/3 × (d_u + 2·d_o) / (d_u + d_o)
```

**Biegemoment des Mastes am Mastfuß:**

```
M_Mast = F_Mast × z_Mast
```

**Windkraft auf die Antenne:**

```
F_Antenne = q × c_w,A × A_A
M_Antenne = F_Antenne × h_A
```

**Gesamtkraft und Gesamtmoment:**

```
F_gesamt = F_Mast + F_Antenne
M_gesamt = M_Mast + M_Antenne
```

### 2.4 Annahmen

- Luftdichte konstant mit ρ = 1,25 kg/m³ (Meeresniveau, 10 °C).
- Linearer Durchmesserverlauf (Kegelstumpf); für zylindrische Masten gilt d_u = d_o.
- Der Böenfaktor wird direkt auf den Staudruck angewendet; eine böenbedingte Resonanzantwort (dynamische Vergrößerung) wird nicht separat berechnet.
- Die Antenne wird als Punktlast am aerodynamischen Schwerpunkt h_A modelliert.
- Kein Abschattungseffekt zwischen Mast und Antenne.
- Keine Berücksichtigung von Geländerauigkeit, Böenprofil oder Standhöhenkorrektur (vereinfachter Ansatz).

---

## 3. Guy Wire Load — Belastungsberechnung (Momentenmethode)

### 3.1 Methode

Die Drahtspannungen werden über die **Momentenmethode** bestimmt. Physikalische Grundlage ist die Standsicherheit des Mastes gegen Kippen: Das Kippmoment der Windlast um den Mastfuß muss durch das Rückstellmoment der Abspanndrähte aufgehoben werden.

Der Mast wird in Abschnitte unterteilt, wobei jeder Abschnitt einer Abspannebene zugeordnet ist. Für jede Ebene wird das **Kippmoment ihres Abschnitts** um den Mastfuß berechnet und durch die Befestigungshöhe dividiert — das ergibt die erforderliche Horizontalkraft am Abspannpunkt:

```
R_i = M_Abschnitt,i / h_i
```

Diese Formulierung stellt sicher, dass eine höhere Befestigung (größerer Hebelarm) eine **geringere** erforderliche Drahtkraft ergibt — physikalisch korrektes Verhalten für eine gelenkig gelagerte Stütze.

Diese Methode setzt voraus, dass der Windlast-Rechner vorher ausgefüllt wurde; die Ergebnisse werden direkt übernommen.

### 3.2 Abschnittsgrenzen

Gegeben N Abspannebenen mit Befestigungshöhen h₁ < h₂ < … < h_N und Gesamthöhe H:

| Ebene | Untergrenze | Obergrenze |
|-------|-------------|------------|
| 1 | 0 | (h₁ + h₂) / 2 |
| i (Mitte) | (h_{i−1} + h_i) / 2 | (h_i + h_{i+1}) / 2 |
| N (oberste) | (h_{N−1} + h_N) / 2 | H |
| — (N = 1) | 0 | H |

### 3.3 Kippmoment je Abschnitt

Der Mastdurchmesser verläuft linear mit der Höhe z:

```
d(z) = d_u + (d_o − d_u) × z / H
```

Für einen Abschnitt von z_a bis z_b ergibt sich die Windkraft (wird zur Anzeige als „Abschnittskraft" verwendet):

```
A_Abschnitt = (d(z_a) + d(z_b)) / 2 × (z_b − z_a)
F_Abschnitt = q × c_w × A_Abschnitt
```

Das Kippmoment des Abschnitts um den Mastfuß (z = 0) ist das Integral der Windlast gewichtet mit der Höhe:

```
M_Abschnitt = q × c_w × ∫[z_a..z_b] d(z) × z dz
```

Mit linearem Durchmesserverlauf ergibt sich die geschlossene Form:

```
M_Abschnitt = q × c_w × [ d_u × z²/2 + slope × z³/3 ] ausgewertet von z_a bis z_b

mit slope = (d_o − d_u) / H
```

### 3.4 Antennenkraft

Die Windkraft der Antenne (F_Antenne) greift am aerodynamischen Schwerpunkt h_A an und erzeugt ein Kippmoment:

```
M_Antenne = F_Antenne × h_A
```

Dieses Moment wird dem Kippmoment der **obersten Abspannebene** addiert:

```
M_gesamt,N = M_Abschnitt,N + M_Antenne
```

Eine höher montierte Antenne erzeugt damit ein größeres Moment und erhöht die Spannung der obersten Abspanndrähte entsprechend — was dem realen physikalischen Verhalten entspricht.

### 3.5 Drahtspannung

Erforderliche Horizontalkraft an Ebene i:

```
R_i = M_gesamt,i / h_i
```

Der Winkel α (von der Horizontalen) stammt direkt aus der Abspanngeometrie (Kapitel 1):

```
cos α = r / L    (äquivalent zu cos(α × π/180))
```

Horizontalkraft je Draht:

```
F_horiz = R_i / n
```

Drahtspannung (Zugkraft im Draht):

```
T = R_i / (n × cos α)
```

Umrechnung in Kilogramm-Kraft:

```text
T_kgf = T / 9,81
```

### 3.6 Annahmen

- Alle Drähte einer Ebene tragen gleichmäßig (symmetrische Abspannung, gleichmäßige Windlast).
- Der Mast wird als biegestarre Pendelstütze (Kippgelenk am Fuß, kein Biegemoment am Fuß) modelliert; das Fundament kann Horizontalkräfte aufnehmen.
- Vorspannkraft der Drähte wird nicht berücksichtigt; die berechnete Spannung ist die reine windbedingte Zusatzkraft.
- Dynamische Lasten, Schnee- und Eislasten sowie seismische Einwirkungen bleiben unberücksichtigt.

---

## 4. Spider Beam Mast-Konfigurator — Teleskop-Segmentlogik

### 4.1 Methode

Der Konfigurator berechnet für einen Teleskop-Mast (Spiderbeam 14m HD), welche Segmente aus dem Grundrohr herausgezogen sind und auf welchen absoluten Höhen die Abspannpunkte liegen.

### 4.2 Eingaben

| Größe | Symbol | Einheit | Beschreibung |
| ----- | ------ | ------- | ------------ |
| Gewünschte Masthöhe | H | m | Ganzzahlig, 1–14 m |
| Segmentanzahl | S | — | Anzahl der Teleskopsegmente (14 beim 14m HD) |
| Segmentlänge | l | m | Länge je Segment (1,0 m) |
| Abspannpunkte | — | — | Segmentnummern mit Abspannöse (10, 12, 14) |

### 4.3 Berechnungen

**Erstes aktives Segment** (unterste nicht im Grundrohr verbliebene Einheit):

```text
firstActive = S + 2 − H
```

Segmente mit Nummer ≥ `firstActive` sind ausgezogen; alle darunter verbleiben im Grundrohr. Segment 1 (Grundrohr) bleibt immer am Boden und zählt nicht als aktives Segment.

**Höhe eines Abspannpunkts** (Segment N ausgezogen):

```text
h_N = H + N − (S + 1)
```

*Beispiel (H = 10, S = 14, N = 10):* `h_10 = 10 + 10 − 15 = 5 m`

*Beispiel (H = 14, S = 14, N = 14):* `h_14 = 14 + 14 − 15 = 13 m` — Spitze auf 13 m, da Segment 14 einen Meter über dem vorletzten endet.

### 4.4 Annahmen

- Jedes Segment hat exakt eine Länge von 1,0 m.
- Ein Segment ist entweder vollständig ausgezogen oder vollständig im Grundrohr.
- Der Abspannpunkt liegt am **unteren Ende** des jeweiligen Segments.

---

## 5. Hinweise und Grenzen

Die Berechnungen in diesem Tool sind **Planungsschätzungen** und kein Ersatz für eine statische Bemessung durch einen zugelassenen Tragwerksplaner. Insbesondere:

- Für genehmigungspflichtige Anlagen (z. B. Bebauungsplan, Dach- oder Dauerinstallationen) ist ein Standsicherheitsnachweis nach EN 1991-1-4 erforderlich.
- Die Berechnungen setzen idealisierte Bedingungen voraus (senkrechter Mast, symmetrische Abspannung, keine Geländekorrektur).
- Materialfestigkeiten, Sicherheitsbeiwerte und Anschlussbemessung sind nicht Bestandteil dieses Tools.
