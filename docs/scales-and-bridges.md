# Scales, units, and bridges

## Provisional scale ladder

These centralized defaults scaffold the ladder; several are adopted conventions to validate when their scene is implemented. Never silently change a definition because that changes both the pedagogical meaning and bridge sequence.

| ID                             | Adopted reference length | Main unit | Status                                 |
| ------------------------------ | -----------------------: | --------- | -------------------------------------- |
| `human`                        |                    1.7 m | m         | representative height                  |
| `earth`                        |                12,742 km | km / Mm   | diameter                               |
| `sun`                          |        1.3927 million km | km / Gm   | diameter                               |
| `earth-sun`                    |                     1 AU | AU        | separation convention                  |
| `solar-system`                 |                   100 AU | AU        | provisional span                       |
| `solar-neighborhood`           |                    10 pc | pc        | provisional full span                  |
| `galactic-center-neighborhood` |                    10 pc | pc        | same scale as sibling                  |
| `milky-way`                    |                   30 kpc | kpc       | representative stellar disk diameter   |
| `local-group`                  |                    3 Mpc | Mpc       | provisional extent                     |
| `virgo`                        |                 16.5 Mpc | Mpc       | provisional Local Group–Virgo distance |
| `bao`                          |            147 Mpc class | Mpc       | convention to document                 |
| `observable-universe`          |  28.5 Gpc class diameter | Gpc       | distance convention to document        |

Solar System extent, Solar-neighborhood span, Milky Way boundary, Local Group extent, Virgo reference, BAO convention, and observable-universe convention require an explicit source/definition pass with the relevant scene.

## Canonical lengths and formatting

Store every physical length once in SI meters. Conversion and display are presentation concerns. Centralize exact/conventional constants such as AU, parsec, and light-year, and attach provenance to non-exact adopted values.

The formatter supports a natural primary unit plus relevant secondary units across:

- `cm` at the Human scale, and `m`, `km`, `Mm`, `Gm`, `Tm`, `Pm`, `Em`, `Zm`, `Ym` where useful;
- `AU`;
- `ly`, `kly`, `Mly`, `Gly`;
- `pc`, `kpc`, `Mpc`, `Gpc`.

Do not use unfamiliar legal prefixes just because they exist. Prefer conventional astronomical units or readable scientific notation. Use locale-aware grouping but keep unit symbols unchanged, and match precision to source accuracy and teaching purpose rather than exposing floating-point noise.

## Bridge legibility

Every adjacent transition must communicate its reference-length ratio. A single comparison frame is enough when the smaller bar remains meaningful; large ratios get intermediate scale-only frames.

Planning responds to available width. With a main bar around 60% of the comparison width, aim to keep the smaller bar about 8–12 physical CSS pixels (10 px default). These are design tokens, not a fixed ratio assumption:

```ts
type BridgeConfig = {
  mainBarFraction: number;
  minSmallBarPx: number;
  preferredStepRatios: number[];
};
```

Automatic steps prefer pedagogically clean 1–2–5 values across powers of ten. Transitions may define milestones where a unit boundary teaches more than mathematically even steps, for example `100 AU → 10,000 AU → 1 pc → 10 pc` or `10 pc → 1 kpc → 30 kpc`.

Support both automatic planning and per-transition `bridgeMilestones`. Manual milestones remain subject to legibility: the planner may fill an overlarge segment rather than producing an invisible bar.

## Bridge state and rendering

A bridge step compares two lengths directly and shows the ratio and unit conversions. Intermediate values:

- are not scene IDs or hierarchy levels;
- receive no astronomical names or 3D/decorative content;
- are reversible;
- use the exact forward sequence in reverse during backward navigation.

Use short fades/bar easing only between discrete states. Previous/Next are explicit buttons; wheel/pinch never advances bridge steps or scenes.

## Test expectations

Cover modest and large ratios, responsive widths, manual milestones, and exact forward/backward symmetry. Expected qualitative cases:

- Human → Earth needs several steps.
- Earth → Sun and Sun → 1 AU may need only a direct frame when legible.
- Solar System → Solar neighborhood can cross 10,000 AU and 1 pc.
- Solar neighborhood → Milky Way can cross 1 kpc.
- Local Group → Virgo needs no artificial decade.
- Virgo → BAO is moderate.
- BAO → Observable Universe may need a Gpc-class step depending on viewport width.

Do not freeze exact frame counts without testing the responsive rendering.
