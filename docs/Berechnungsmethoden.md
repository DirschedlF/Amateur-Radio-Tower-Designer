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

## 3. Guy Wire Load — Belastungsberechnung (Abschnittsmethode)

### 3.1 Methode

Die Drahtspannungen werden über die **Abschnittsmethode** (Sectional Method) bestimmt. Der Mast wird in Abschnitte unterteilt, wobei jeder Abschnitt einer Abspannebene zugeordnet ist. Die Abschnittsgrenzen folgen der **Mittelpunktregel**: Die Grenze zwischen zwei benachbarten Ebenen liegt auf halbem Weg zwischen den Befestigungshöhen.

Diese Methode setzt voraus, dass der Windlast-Rechner vorher ausgefüllt wurde; die Ergebnisse werden direkt übernommen.

### 3.2 Abschnittsgrenzen

Gegeben N Abspannebenen mit Befestigungshöhen h₁ < h₂ < … < h_N und Gesamthöhe H:

| Ebene | Untergrenze | Obergrenze |
|-------|-------------|------------|
| 1 | 0 | (h₁ + h₂) / 2 |
| i (Mitte) | (h_{i−1} + h_i) / 2 | (h_i + h_{i+1}) / 2 |
| N (oberste) | (h_{N−1} + h_N) / 2 | H |
| — (N = 1) | 0 | H |

### 3.3 Windkraft je Abschnitt

Der Mastdurchmesser verläuft linear mit der Höhe z:

```
d(z) = d_u + (d_o − d_u) × z / H
```

Für einen Abschnitt von z_a bis z_b ergibt sich die Trapezfläche:

```
A_Abschnitt = (d(z_a) + d(z_b)) / 2 × (z_b − z_a)
F_Abschnitt = q × c_w × A_Abschnitt
```

### 3.4 Antennenkraft

Die gesamte Windkraft der Antenne (F_Antenne aus dem Windlast-Rechner) wird konservativ der **obersten Abspannebene** zugerechnet, unabhängig von der tatsächlichen Montagehöhe. Dies entspricht dem häufigsten Anwendungsfall (Antenne oberhalb der letzten Abspannebene) und ist in jedem Fall auf der sicheren Seite.

```
F_gesamt,N = F_Abschnitt,N + F_Antenne
```

### 3.5 Drahtspannung

Der Winkel α (von der Horizontalen) stammt direkt aus der Abspanngeometrie (Kapitel 1). Damit gilt:

```
cos α = r / L    (äquivalent zu cos(α × π/180))
```

Horizontalkraft je Draht:

```
F_horiz = F_gesamt / n
```

Drahtspannung (Zugkraft im Draht):

```
T = F_gesamt / (n × cos α)
```

Umrechnung in Kilogramm-Kraft:

```
T_kgf = T / 9,81
```

### 3.6 Annahmen

- Alle Drähte einer Ebene tragen gleichmäßig (symmetrische Abspannung, gleichmäßige Windlast).
- Der Mast wird als Pendelstütze (gelenkig am Fuß) modelliert; die horizontale Windkraft wird vollständig von den Abspanndrähten aufgenommen.
- Vorspannkraft der Drähte wird nicht berücksichtigt; die berechnete Spannung ist die reine windbedingte Zusatzkraft.
- Dynamische Lasten, Schnee- und Eislasten sowie seismische Einwirkungen bleiben unberücksichtigt.
- Die Antennenkraft wird der obersten Ebene zugeordnet (konservativ).

---

## 4. Hinweise und Grenzen

Die Berechnungen in diesem Tool sind **Planungsschätzungen** und kein Ersatz für eine statische Bemessung durch einen zugelassenen Tragwerksplaner. Insbesondere:

- Für genehmigungspflichtige Anlagen (z. B. Bebauungsplan, Dach- oder Dauerinstallationen) ist ein Standsicherheitsnachweis nach EN 1991-1-4 erforderlich.
- Die Berechnungen setzen idealisierte Bedingungen voraus (senkrechter Mast, symmetrische Abspannung, keine Geländekorrektur).
- Materialfestigkeiten, Sicherheitsbeiwerte und Anschlussbemessung sind nicht Bestandteil dieses Tools.
