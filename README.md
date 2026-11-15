# Lunar Base Junior

A pixel art mission simulator for kids, built for the NASA Space Apps Challenge 2026 challenge **"Build a Mission Simulator for Junior Astronauts"**.

**Play it:** https://victoriat19.github.io/nasa/

Create your own astronaut, pack the ship on Earth, fly to the Moon, build a base at the lunar south pole and explore the surface for samples. Every choice is a real mission trade-off between life support, radiation protection, energy and food.

## The three phases

1. **Pack the ship (Earth).** Choose the modules and supplies for your mission. Live graphs show mission time, life support, protective shield and resilience. More items make the ship heavier, so the trip takes longer and you have less time on the Moon. The airlock is always included.
2. **Build the base (Moon).** The base is a room you can walk around and decorate: furniture goes on the floor, windows, shields and solar panels go on the walls. First make the base comfortable (a dining table and one decoration). Then keep four resources alive: **oxygen, power, food and hull**. Every block makes the base use more power and mission time. Play the power grid, storm shield and dark crater missions, and grow tomatoes in the greenhouse step by step: plant, water, then turn on the red and blue LED light, but not for too long or the plant burns and the base loses power.
3. **Explore the surface.** Leave through the airlock to collect samples. Oxygen, shield and energy drop every second, so you must get back to the base in time.

## KAI, the helper robot

KAI can finish a task for you or show you the way to the next discovery on an expedition. The price: it uses **half of your oxygen**. Every shortcut has a cost.

## How a mission ends

- Oxygen runs out, the hull collapses, food runs out or the radiation dose hits 250 mSv: the mission is lost.
- Time runs out before the main mission is finished: the astronaut comes home, but the mission failed.
- Main mission finished and back home in time: the mission is complete. Every task gives points, and points turn into 1 to 5 stars. Stars unlock the next missions (Moon debris cleanup, a new lunar greenhouse, a strange signal), shown locked on the mission board.

## Levels based on real missions

| Level | Real mission | Real duration |
| --- | --- | --- |
| 1 | Apollo 11 | 8 d 3 h 18 min, 21 h 36 min on the surface |
| 2 | Apollo 17 | 12 d 13 h 52 min, about 75 h on the surface |
| 3 | Artemis I | 25 d 10 h 53 min |

Your time at the Moon is the real mission length minus the trip there and back. The heavier the ship, the longer the trip.

## NASA data used

| Data | How the game uses it |
| --- | --- |
| [DONKI](https://api.nasa.gov), coronal mass ejections (CME) | The fastest CME of the last 30 days sets the size of the solar storm at the base and on expeditions. Offline, the storm is modeled on the August 1972 event. |
| [DONKI](https://api.nasa.gov) solar flares (FLR), solar energetic particles (SEP) and geomagnetic storms (GST) | The Space Weather panel lists the real events from the last months and explains flare classes and the Kp index. |
| [NASA TechPort](https://techport.nasa.gov) | Real NASA technology projects appear while you plan the ship. |
| [NASA Image and Video Library](https://images.nasa.gov) | Each discovery on an expedition shows a real NASA photo. |
| Apollo 11, Apollo 17 and Artemis I mission facts | Mission length, surface time and sample mass for each level. |
| NASA radiation research | About 1.37 mSv per day on the lunar surface, 250 mSv mission limit, hydrogen-rich shielding works best. |
| LRO and LCROSS results | Water ice is in permanently shadowed craters near the south pole. |

Values are simplified for education.

## Accessibility

- Game speed (0.5x, 0.75x, 1x), volume and reduced motion.
- High contrast, large text and captions for sounds.
- Full keyboard play with visible focus; Esc closes menus.
- Screen reader announcements.
- The game follows the system settings for reduced motion and contrast.
- English and Portuguese in the character creator.

## How it works

- Plain HTML, CSS and JavaScript with canvas 2D. No build step and no dependencies.
- `index.html` and `expedition.html`: the two pages (base and surface exploration).
- `css/`: styles for each page.
- `js/core.js`: levels, save data and settings. `js/data.js`: items, blocks, ship modules and story. `js/state.js`: shared game state, audio and helpers.
- `js/character.js`: the astronaut sprite, colors, accessories and animation.
- `js/room.js`: the isometric base room: floor, walls, furniture, building and walking. `js/hub.js`: astronaut actions, faults, storms and the story. `js/ui.js`: menus and the character creator.
- `js/plan.js`: ship planning, mission clock and NASA space weather. `js/minigames.js`: the missions.
- `js/mission.js`: oxygen, power, hull, endings, points, stars and the greenhouse. `js/main.js`: game loop, HUD and start up.
- `js/expedition.js`: surface exploration. `art/art.js`: the pixel art characters and icons.
- Progress is saved in the browser (localStorage).

## Use of AI

An AI coding assistant helped write parts of the code. The team directed the game design, chose the NASA data to use, and tested and reviewed the result.

## References

- NASA Space Apps Challenge: https://www.spaceappschallenge.org
- NASA Open APIs (DONKI): https://api.nasa.gov
- NASA TechPort: https://techport.nasa.gov
- NASA Image and Video Library: https://images.nasa.gov
- Apollo 11: https://www.nasa.gov/mission/apollo-11/
- Apollo 17: https://www.nasa.gov/mission/apollo-17/
- Artemis I: https://www.nasa.gov/mission/artemis-i/
- Lunar Reconnaissance Orbiter: https://lunar.gsfc.nasa.gov

Educational project. Not an official NASA product.
