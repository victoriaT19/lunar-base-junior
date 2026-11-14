# Lunar Base Junior

A browser game about surviving the first days of a lunar outpost, built for the NASA Space Apps Challenge 2026 challenge **"Build a Mission Simulator for Junior Astronauts"**.

**Play it:** https://victoriat19.github.io/nasa/

You are Mira, a junior astronaut on her first mission. Your lander has touched down at the Shackleton crater rim near the Moon's south pole. In six short chapters you explore a procedurally generated lunar surface, mine ore and water ice, refine oxygen, craft radiation shielding, scan real discoveries and survive a solar storm, then build an outpost.

## Why it matters

Space STEM content often hides the engineering trade-offs that decide a real mission. In this game every trade-off is something you feel:

- **Life support:** your oxygen drains while you breathe. Refill at the lander or refine more from lunar minerals.
- **Radiation protection:** the Moon has no atmosphere or magnetic field. A solar storm drains your hazard protection fast, and polymer plates make it stronger.
- **Power:** suit energy recharges in sunlight and drains in the dark, cold craters, where the water ice is.
- **Resources:** ice and carbon are only in permanently shadowed craters, so the thing you need most is in the most dangerous place.

## How to play

| Action | Control |
| --- | --- |
| Move | WASD or arrow keys (joystick on phones) |
| Sprint | Shift |
| Mining beam | Hold click or Space (button on phones) |
| Scan a discovery / use the lander terminal | E |
| Menu: craft, suit, terminal, codex, NASA data | I |

Objectives: scan a discovery, refine oxygen, craft and install a polymer plate, survive the storm, repair the lander, build the solar array and shelter dome.

## How it works

- Single-page HTML, CSS and JavaScript. No build step and no dependencies.
- The world is generated from a random seed with value noise and a hash-based crater generator, so every run is different.
- A survival model tracks life support, hazard protection, suit energy and a radiation dose in mSv. If the dose reaches 250 mSv the mission fails.
- Radiation shielding uses an exponential attenuation model: more polymer layers reduce hazard protection drain during storms.

## NASA data used

| Data | How the game uses it |
| --- | --- |
| [DONKI space weather database](https://api.nasa.gov) (CME analysis) | The speed of the fastest coronal mass ejection of the last 30 days sets the size of the solar storm. If the API is unreachable the storm is modeled on the August 1972 event. |
| Lunar Reconnaissance Orbiter (LRO) mission, [lunar.gsfc.nasa.gov](https://lunar.gsfc.nasa.gov) | Illumination and permanently shadowed craters: sunlit ridges recharge the suit, dark craters hold the ice and drain energy. |
| LCROSS impact results | Water ice exists in permanently shadowed craters. |
| NASA ISRU research | Oxygen can be extracted from minerals such as ilmenite. |
| NASA radiation protection research | Hydrogen-rich polymers such as polyethylene shield radiation better than metal. |
| Chang'e-4 lander radiation measurements (cited by NASA studies) | Cosmic radiation on the lunar surface is about 1.37 mSv per day. |

Values are approximate and simplified for education.

## Use of AI

An AI coding assistant helped write parts of the code. The team directed the game design, chose the NASA data to use, tested and reviewed the result.

## References

- NASA Space Apps Challenge: https://www.spaceappschallenge.org
- NASA Open APIs (DONKI): https://api.nasa.gov
- NASA data portal: https://data.nasa.gov
- NASA Image and Video Library: https://images.nasa.gov
- NASA Earthdata: https://earthdata.nasa.gov
- Lunar Reconnaissance Orbiter: https://lunar.gsfc.nasa.gov
- ISS Veggie experiment: https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=374

Educational project. Not an official NASA product.
