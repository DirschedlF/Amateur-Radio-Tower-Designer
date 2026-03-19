# Benutzerhandbuch — Amateurfunk Mast-Designer

Dieses Handbuch erklärt Schritt für Schritt, wie du den Mast-Designer verwendest — von der ersten Eingabe bis zur Auswertung der Drahtspannungen.

---

## Überblick

Der Mast-Designer besteht aus zwei Rechnern, die zusammenarbeiten:

1. **Windlast-Rechner** — berechnet die Windkräfte auf Mast und Antenne
2. **Abspannungsrechner** — berechnet Drahtlängen, Winkel und — kombiniert mit der Windlast — die Spannung in jedem Abspanndraht

Du kannst beide Rechner unabhängig voneinander verwenden. Für die vollständige Lastberechnung (Drahtspannungen) benötigst du jedoch beide.

---

## Schritt 1: Windlast berechnen

Öffne den **Windlast-Rechner** über die linke Seitenleiste.

### 1.1 Windgeschwindigkeit

Gib die Windgeschwindigkeit in m/s ein. Der Staudruck `q` wird automatisch berechnet und angezeigt.

> **Welchen Wert verwenden?**
>
> Für einen provisorischen oder semipermanenten Amateurfunkmast ohne besondere Exposition (kein Bergrücken, kein Küstenbereich, nicht auf einem Hochhaus) sind folgende Richtwerte üblich:
>
> | Szenario | Windgeschwindigkeit | Beaufort |
> |----------|---------------------|----------|
> | Ruhiges Wetter, leichter Wind | 5–8 m/s | 3–4 |
> | Frischer Wind, normale Böen | 10–15 m/s | 5–6 |
> | Sturm, übliche Auslegung Amateurfunk | 20–25 m/s | 8–9 |
> | Normative Auslegung WZ 1 (DIN EN 1991-1-4) | 22,5 m/s | 9 |
>
> **Empfehlung:** Für eine Dauerinstallation nicht unter **22,5 m/s** gehen — das ist der normative Wert für Windzone 1 (z. B. München/Bayern) nach DIN EN 1991-1-4 und die Basis für behördliche und versicherungsrelevante Nachweise. Für erhöhte Lagen oder Küstennähe gelten höhere Windzonen (WZ 2–4).

### 1.2 Böenfaktor

Der Böenfaktor berücksichtigt kurzzeitige Windspitzen (Böen), die über dem Mittelwind liegen. Der Standardwert ist **1,7**.

> **Warum ist der Böenfaktor wichtig?**
>
> Der Staudruck steigt mit dem **Quadrat** der Windgeschwindigkeit: `q = ½ × ρ × v²`. Eine Böe mit doppelter Geschwindigkeit erzeugt viermal so viel Druck. Böen sind kurze, starke Windspitzen — und genau die sind maßgeblich für die mechanische Belastung.
>
> Die DIN EN 1991-1-4 unterscheidet deshalb:
>
> | Größe | Bedeutung |
> |-------|-----------|
> | **v**m | Mittlere Windgeschwindigkeit (10-Minuten-Mittel) |
> | **v**p | Böengeschwindigkeit (Spitzenwert) |
> | **q**p | Spitzenstaudruck — maßgeblich für die Tragwerksauslegung |
>
> Der Böenfaktor liegt je nach Geländekategorie und Höhe bei ca. **1,5–1,7** auf den Staudruck. Der Standardwert **1,7** im Tool entspricht einer konservativen Auslegung für offenes Gelände in mittlerer Höhe und ist für die meisten Amateurfunk-Installationen geeignet.

### 1.3 Mast

| Feld | Beschreibung |
|------|-------------|
| Masthöhe | Gesamthöhe des Mastes in Metern |
| ⌀ unten | Außendurchmesser des Mastes am Fuß in Millimetern |
| ⌀ oben | Außendurchmesser des Mastes an der Spitze in Millimetern |
| cw | Widerstandsbeiwert des Mastes |

Bei einem einfachen Steckmasten (zylindrisch) sind beide Durchmesser gleich. Bei einem konischen Schiebemasten unterscheiden sich die Werte.

> **Was ist der cw-Wert?**
>
> Der Widerstandsbeiwert **cw** ist eine dimensionslose Kennzahl, die beschreibt, wie stark ein Körper dem Wind Widerstand entgegensetzt — relativ zu seiner projizierten Fläche und dem herrschenden Staudruck. Die Windkraftformel lautet:
>
> `F = cw × A × q`
>
> Ein cw = 1,0 entspricht einem flachen Brett, das dem Wind senkrecht entgegensteht. Aerodynamisch günstige Formen liegen deutlich darunter.
>
> **Typische Werte im Vergleich:**
>
> | Form | cw | Intuition |
> |------|----|-----------|
> | Tragflügelprofil | 0,04–0,1 | Fast kein Nachlauf |
> | Kugel | 0,47 | Rund, aber breiter Nachlauf |
> | Runder Zylinder | 1,0–1,2 | Breiter Nachlauf, Teilvakuum |
> | Vierkantrohr | 1,3–2,0 | Ecken erzwingen Ablösung |
> | Flachplatte quer | 1,8–2,0 | Maximale Ablösung |
>
> **Warum cw ≈ 1,2 für Stahlrohre?** Ein runder Stab ist aerodynamisch günstiger als eine Ecke — aber kein Stromlinienkörper. Die Strömung trennt sich bei etwa 80° vom Umfang und erzeugt einen breiten, turbulenten Nachlauf (Unterdruck), der den Körper zurücksaugt. Dieser Effekt dominiert bei typischen Amateurfunk-Masten (Teleskopstäbe, dünne Rohre im Sturm). Der Wert cw = 1,1 im Tool ist daher konservativ und physikalisch korrekt angesetzt.
>
> Für **Antennen** (Yagi-Boom, Dipole, Vertikals) wird cw = 0,8 als Standardwert verwendet — die komplexe Struktur aus dünnen Elementen verhält sich im Mittel günstiger als ein Vollzylinder.

### 1.4 Antenne

| Feld | Beschreibung |
|------|-------------|
| Antennenfläche | Windangriffsfläche der Antenne in m² (aus Datenblatt oder Hersteller) |
| cw | Widerstandsbeiwert der Antenne (Standard: 0,8) |
| Montagehöhe | Höhe des aerodynamischen Schwerpunkts der Antenne über dem Mastfuß |

Die **Montagehöhe** entspricht nicht dem Befestigungspunkt, sondern dem Schwerpunkt der Antennenfläche. Bei einer einfachen vertikalen Antenne liegt dieser etwa in der Mitte der Antenne. Der Wert beeinflusst das Biegemoment, nicht die Kraft.

### 1.5 Ergebnisse lesen

Der Rechner zeigt Windkraft und Biegemoment für Mast, Antenne und die Gesamtsumme. Das Diagramm visualisiert die angreifenden Kräfte.

---

## Schritt 2: Abspanngeometrie eingeben

Wechsle zum **Abspannungsrechner** über die Seitenleiste. Die Masthöhe wird automatisch übernommen.

### 2.1 Masthöhe

Bereits aus dem Windlast-Rechner übertragen. Änderungen hier werden auch dort synchronisiert.

### 2.2 Abspannebenen

Wähle die Anzahl der Abspannebenen (1–3). Für jeden Level gibst du drei Werte ein:

| Feld | Beschreibung |
|------|-------------|
| Höhe (m) | Höhe des Abspannpunkts am Mast über Grund |
| Radius (m) | Horizontale Entfernung vom Mastfuß zum Erdanker |
| Drähte | Anzahl der Abspanndrähte in dieser Ebene (3 oder 4) |

**Faustregel für den Radius:** Ein Abspannwinkel von 45–60° zur Horizontalen ist mechanisch günstig. Das entspricht einem Radius, der etwa der Abspannhöhe entspricht (Winkel ~45°). Zu flache Winkel (< 30°) erhöhen die Drahtspannung erheblich — das Tool zeigt den tatsächlichen Winkel in den Ergebnissen.

### 2.3 Ergebnisse: Geometrie

Die Tabelle zeigt für jede Ebene:

- **Drahtlänge** — Länge eines einzelnen Drahtes vom Mastpunkt zum Erdanker
- **Winkel (Horiz.)** — Winkel des Drahtes gegenüber der Horizontalen
- **Winkel (Mast)** — Winkel des Drahtes gegenüber der Mastachse
- **Gesamt Ebene** — Gesamtlänge aller Drähte in dieser Ebene
- **Gesamtlänge** — Drahtbedarf für alle Ebenen zusammen

---

## Schritt 3: Drahtspannungen auswerten

Nachdem beide Rechner ausgefüllt sind, erscheint am Ende des Abspannungsrechners der Abschnitt **Belastungsberechnung**. Er zeigt die Windlasten pro Ebene und die daraus resultierenden Drahtspannungen.

### 3.1 So funktioniert die Berechnung

Der Mast wird in Abschnitte aufgeteilt — jede Abspannebene übernimmt die Windlast des Mastabschnitts, der ihr am nächsten liegt. Die oberste Ebene trägt zusätzlich die Windlast der Antenne.

### 3.2 Tabelle verstehen

| Spalte | Bedeutung |
|--------|-----------|
| Abschnittskraft | Gesamte Windkraft auf den zugeordneten Mastabschnitt (N) |
| Horiz. je Draht | Horizontale Kraftkomponente pro einzelnem Abspanndraht (N) |
| Drahtspannung | Tatsächliche Zugkraft im Draht (N und kg) — dieser Wert ist für die Auslegung des Drahtes relevant |

Die Drahtspannung ist immer größer als die horizontale Kraft, weil der Draht schräg verläuft. Je flacher der Winkel, desto größer der Unterschied.

### 3.3 Hinweis zur Auslegung

Die angegebene Drahtspannung ist die reine Windlastkomponente. Hinzu kommt die **Vorspannkraft**, mit der der Draht beim Aufbau angezogen wird. Für die Wahl des Drahtes (Mindestbruchlast) sollte ein ausreichender Sicherheitsfaktor berücksichtigt werden.

> **Empfehlung:** Draht mit einer Mindestbruchlast wählen, die mindestens das 3-fache der berechneten Drahtspannung beträgt.

---

## Hinweise und Grenzen des Tools

- Alle Berechnungen sind **Planungsabschätzungen** — kein Ersatz für einen statischen Nachweis.
- Die Windlastberechnung folgt der Methodik von EN 1991-1-4 (vereinfacht).
- Für genehmigte Dauerinstallationen oder Aufstellungen auf Gebäuden ist ein Standsicherheitsnachweis durch einen Ingenieur erforderlich.
- Der Böenfaktor und die Windgeschwindigkeit sollten der regionalen Windzone angepasst werden.
