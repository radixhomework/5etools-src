// Build the final MM adoption map (aidedd-aligned), with policy skips.
'use strict';
const fs = require('fs');
const diffs = JSON.parse(fs.readFileSync('_translation-work/enhanced/mm-diffs.json', 'utf8'));

const SKIP_EN = new Set([
  // dragon family: repo-wide postfix age style (incl. Dracolich)
  ...diffs.filter(d => /Dragon$|Dragon Wyrmling$|^Young |^Adult |^Ancient |Dracolich/i.test(d.en)).map(d => d.en),
  // comma role-name style (ours prefix style; base-spelling fixed via the base pair)
  'Bandit Captain', 'Bugbear Chief', 'Drow Elite Warrior', 'Drow Mage', 'Drow Priestess of Lolth',
  'Githyanki Knight', 'Githyanki Warrior', 'Githzerai Monk', 'Githzerai Zerth',
  'Gnoll Fang of Yeenoghu', 'Gnoll Pack Lord', 'Goblin Boss',
  'Kuo-toa Archpriest', 'Kuo-toa Whip', 'Sahuagin Baron', 'Sahuagin Priestess',
  'Yuan-ti Abomination', 'Yuan-ti Pureblood', 'Lizardfolk Shaman',
  'Myconid Adult', 'Myconid Sovereign', 'Myconid Sprout',
  'Half-Red Dragon Veteran', 'Young Remorhaz',
  'Hobgoblin Captain', 'Hobgoblin Warlord',
  // zombie spelling family (repo uses Zombie)
  'Ogre Zombie', 'Beholder Zombie',
  // keep ours (matches official FR or established usage)
  'Axe Beak', 'Cult Fanatic', 'Gibbering Mouther', 'Ice Devil', 'Grimlock',
  'Vampire Spawn', 'Needle Blight', 'Nightmare', 'Roper', 'Magmin',
  'Deep Gnome (Svirfneblin)', 'Orc Eye of Gruumsh', 'Flameskull',
  'Reef Shark', 'Rug of Smothering',
]);

const adopt = diffs.filter(d => !SKIP_EN.has(d.en));
console.log(`adopting: ${adopt.length} | skipped: ${diffs.length - adopt.length}`);
fs.writeFileSync('_translation-work/enhanced/adopt-map.json', JSON.stringify(Object.fromEntries(adopt.map(d => [d.en, d.aidedd])), null, 2));

// build old->new pairs (current FR name -> aidedd name)
const pairs = adopt.map(d => [d.ours, d.aidedd]);
// manual companion pairs (skipped families that still need the base-term adoption)
pairs.push(['Zombie beholder', 'Zombie tyrannoeil']);
pairs.sort((a, b) => b[0].length - a[0].length);
fs.writeFileSync('_translation-work/enhanced/rename-pairs.json', JSON.stringify(pairs, null, 2));
console.log('pairs written:', pairs.length);
