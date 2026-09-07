// One-shot translation helper for class-fighter.json (EN -> FR)
const fs = require('fs');
const path = 'D:/GitHub/radixhomework/5etools-src/data/class/class-fighter.json';

// ---- Name dictionary (applied to "name" values, titles, labels, captions) ----
const names = {
	"Fighter": "Guerrier",
	// subclasses
	"Battle Master": "Maître de guerre",
	"Champion": "Champion",
	"Eldritch Knight": "Magelame",
	"Purple Dragon Knight (Banneret)": "Chevalier du Dragon Pourpre (Banneret)",
	"Arcane Archer": "Archer arcanique",
	"Cavalier": "Cavalier",
	"Samurai": "Samouraï",
	"Echo Knight": "Chevalier d'écho",
	"Psi Warrior": "Guerrier psionique",
	"Rune Knight": "Chevalier des runes",
	"Banneret": "Banneret",
	// class features (PHB)
	"Fighting Style": "Style de combat",
	"Second Wind": "Second souffle",
	"Action Surge": "Explosion d'action",
	"Martial Archetype": "Archétype martial",
	"Ability Score Improvement": "Amélioration de caractéristique",
	"Martial Versatility": "Polyvalence martiale",
	"Extra Attack": "Attaque supplémentaire",
	"Martial Archetype feature": "Capacité d'archétype martial",
	"Indomitable": "Indomptable",
	"Extra Attack (2)": "Attaque supplémentaire (2)",
	"Indomitable (two uses)": "Indomptable (deux utilisations)",
	"Action Surge (two uses)": "Explosion d'action (deux utilisations)",
	"Indomitable (three uses)": "Indomptable (trois utilisations)",
	"Extra Attack (3)": "Attaque supplémentaire (3)",
	// class features (XPHB)
	"Weapon Mastery": "Maîtrise des armes",
	"Tactical Mind": "Esprit tactique",
	"Fighter Subclass": "Sous-classe de guerrier",
	"Tactical Shift": "Déplacement tactique",
	"Subclass Feature": "Capacité de sous-classe",
	"Tactical Master": "Maîtrise tactique",
	"Two Extra Attacks": "Deux attaques supplémentaires",
	"Studied Attacks": "Attaques étudiées",
	"Epic Boon": "Don épique",
	"Three Extra Attacks": "Trois attaques supplémentaires",
	// subclass features
	"Manifest Echo": "Manifestation d'écho",
	"Unleash Incarnation": "Incarnation déchaînée",
	"Echo Avatar": "Avatar d'écho",
	"Shadow Martyr": "Martyr de l'ombre",
	"Reclaim Potential": "Récupération du potentiel",
	"Legion of One": "Légion d'un seul",
	"Combat Superiority": "Supériorité au combat",
	"Maneuvers": "Manœuvres",
	"Maneuver Options": "Options de manœuvre",
	"Student of War": "Étudiant de la guerre",
	"Additional Maneuvers": "Manœuvres supplémentaires",
	"Additional Superiority Die": "Dé de supériorité supplémentaire",
	"Know Your Enemy": "Connaissez votre ennemi",
	"Improved Combat Superiority": "Supériorité au combat améliorée",
	"Improved Combat Superiority (d10)": "Supériorité au combat améliorée (d10)",
	"Improved Combat Superiority (d12)": "Supériorité au combat améliorée (d12)",
	"Relentless": "Implacable",
	"Improved Critical": "Critique amélioré",
	"Remarkable Athlete": "Athlète remarquable",
	"Additional Fighting Style": "Style de combat supplémentaire",
	"Superior Critical": "Critique supérieur",
	"Survivor": "Survivant",
	"Spellcasting": "Lancement de sorts",
	"Weapon Bond": "Lien d'arme",
	"War Bond": "Lien d'arme",
	"War Magic": "Magie de guerre",
	"Eldritch Strike": "Frappe occulte",
	"Arcane Charge": "Charge arcanique",
	"Improved War Magic": "Magie de guerre améliorée",
	"Rallying Cry": "Cri de ralliement",
	"Restriction: Knighthood": "Restriction : chevalerie",
	"Royal Envoy": "Émissaire royal",
	"Inspiring Surge": "Vague d'inspiration",
	"Bulwark": "Rempart",
	"Protective Field": "Champ protecteur",
	"Psionic Strike": "Frappe psionique",
	"Telekinetic Movement": "Mouvement télékinétique",
	"Psionic Power": "Pouvoir psionique",
	"Psi-Powered Leap": "Saut psionique",
	"Telekinetic Thrust": "Assaut télékinétique",
	"Telekinetic Adept": "Adepte télékinétique",
	"Guarded Mind": "Esprit protégé",
	"Bulwark of Force": "Rempart de force",
	"Telekinetic Master": "Maître télékinétique",
	"Bonus Proficiencies": "Maîtrises supplémentaires",
	"Bonus Proficiency": "Maîtrise supplémentaire",
	"Rune Carver": "Sculpteur de runes",
	"Giant's Might": "Puissance du géant",
	"Additional Rune Known": "Rune supplémentaire connue",
	"Runic Shield": "Bouclier runique",
	"Great Stature": "Grande stature",
	"Master of Runes": "Maître des runes",
	"Runic Juggernaut": "Colosse runique",
	"Arcane Archer Lore": "Savoir de l'archer arcanique",
	"Arcane Shot": "Tir arcanique",
	"Arcane Shot Options": "Options de tir arcanique",
	"Additional Arcane Shot Option": "Option de tir arcanique supplémentaire",
	"Curving Shot": "Tir courbé",
	"Magic Arrow": "Flèche magique",
	"Ever-Ready Shot": "Tir toujours prêt",
	"Born to the Saddle": "Né pour la selle",
	"Unwavering Mark": "Marque inébranlable",
	"Warding Maneuver": "Manœuvre protectrice",
	"Hold the Line": "Tenir la ligne",
	"Ferocious Charger": "Chargeur féroce",
	"Vigilant Defender": "Défenseur vigilant",
	"Fighting Spirit": "Esprit combatif",
	"Elegant Courtier": "Courtisan élégant",
	"Tireless Spirit": "Esprit infatigable",
	"Rapid Strike": "Frappe rapide",
	"Strength before Death": "La force avant la mort",
	"Group Recovery": "Récupération de groupe",
	"Knightly Envoy": "Émissaire chevaleresque",
	"Team Tactics": "Tactique d'équipe",
	"Rallying Surge": "Vague de ralliement",
	"Shared Resilience": "Résilience partagée",
	"Inspiring Commander": "Commandant inspirant",
	"Ultimate Combat Superiority": "Supériorité au combat ultime",
	"Heroic Warrior": "Guerrier héroïque",
	// nested entry names / headers
	"Superiority Dice": "Dés de supériorité",
	"Saving Throws": "Jets de sauvegarde",
	"Cantrips": "Tours de magie",
	"Spell Slots": "Emplacements de sorts",
	"Spells Known of 1st-Level and Higher": "Sorts connus de niveau 1 ou supérieur",
	"Spellcasting Ability": "Caractéristique de lancement de sorts",
	"Prepared Spells of Level 1+": "Sorts préparés de niveau 1 ou supérieur",
	"Changing your Prepared Spells": "Changer vos sorts préparés",
	"Spellcasting Focus": "Instrument de focalisation des sorts",
	"Comprehension": "Compréhension",
	"Polyglot": "Polyglotte",
	"Well Spoken": "Éloquence",
	"Attack": "Attaque",
	"Move": "Déplacement",
	"Bolstered Rally": "Ralliement renforcé",
	"Unshakable Bravery": "Bravoure inébranlable",
	"Defy Death": "Défier la mort",
	"Heroic Rally": "Ralliement héroïque",
	// ability DC/attack mod names
	"Maneuver": "Manœuvre",
	"Spell": "Sort",
	// subclass titles
	"Martial Archetype": "Archétype martial",
	// table captions
	"Spell Slots per Spell Level": "Emplacements de sorts par niveau de sort",
	"Runes Known": "Runes connues",
	"Psi Warrior Energy Dice": "Dés d'énergie psionique du Guerrier psionique",
	// col labels
	"Weapon Mastery": "Maîtrise des armes",
	"{@filter Cantrips Known|spells|level=0|subclass=Fighter: Eldritch Knight}": "{@filter Tours de magie connus|spells|level=0|subclass=Fighter: Eldritch Knight}",
	"{@filter Spells Known|spells|subclass=Fighter: Eldritch Knight}": "{@filter Sorts connus|spells|subclass=Fighter: Eldritch Knight}",
	"{@filter Spells Prepared|spells|subclass=Fighter: Eldritch Knight}": "{@filter Sorts préparés|spells|subclass=Fighter: Eldritch Knight}",
	"{@filter 1st|spells|level=1|subclass=Fighter: Eldritch Knight}": "{@filter 1er|spells|level=1|subclass=Fighter: Eldritch Knight}",
	"{@filter 2nd|spells|level=2|subclass=Fighter: Eldritch Knight}": "{@filter 2e|spells|level=2|subclass=Fighter: Eldritch Knight}",
	"{@filter 3rd|spells|level=3|subclass=Fighter: Eldritch Knight}": "{@filter 3e|spells|level=3|subclass=Fighter: Eldritch Knight}",
	"{@filter 4th|spells|level=4|subclass=Fighter: Eldritch Knight}": "{@filter 4e|spells|level=4|subclass=Fighter: Eldritch Knight}",
	"{@tip Die Size|Psionic Energy Die Size}": "{@tip Taille du dé|Taille du dé d'énergie psionique}",
	"{@tip Number|Psionic Energy Die Number}": "{@tip Nombre|Nombre de dés d'énergie psionique}",
	// table row cells
	"3rd": "3e",
	"7th": "7e",
	"10th": "10e",
	"15th": "15e",
	// optional feature / feat progression display names
	"Arcane Shots": "Tirs arcaniques",
	"Runes": "Runes",
	// refOptionalfeature display overrides
	"Hill Rune (7th Level or Higher)": "Rune de la colline (niveau 7 ou supérieur)",
	"Storm Rune (7th Level or Higher)": "Rune de l'orage (niveau 7 ou supérieur)",
	// equipment / misc
	"{@dice 5d4 × 10|5d4 × 10|Starting Gold}": "{@dice 5d4 × 10|5d4 × 10|Or de départ}"
};

// ---- Prose dictionary (exact full-string match on entry strings) ----
const prose = {
	// PHB equipment
	"(a) {@item Cotte de mailles|phb} or (b) {@item Armure de cuir|phb}, {@item Arc long|phb}, and {@item Flèches (20)|phb|20 arrows}":
		"(a) une {@item Cotte de mailles|phb} ou (b) une {@item Armure de cuir|phb}, un {@item Arc long|phb} et {@item Flèches (20)|phb|20 flèches}",
	"(a) a {@filter martial weapon|items|source=phb|category=basic|type=martial weapon} and a {@item Bouclier|phb} or (b) two {@filter martial weapons|items|source=phb|category=basic|type=martial weapon}":
		"(a) une {@filter arme de guerre|items|source=phb|category=basic|type=martial weapon} et un {@item Bouclier|phb} ou (b) deux {@filter armes de guerre|items|source=phb|category=basic|type=martial weapon}",
	"(a) a {@item Arbalète légère|phb} and {@item Carreaux d'arbalète (20)|phb|20 bolts} or (b) two {@item Hache à une main|phb|handaxes}":
		"(a) une {@item Arbalète légère|phb} et {@item Carreaux d'arbalète (20)|phb|20 carreaux} ou (b) deux {@item Hache à une main|phb|haches à une main}",
	"(a) a {@item Pack d'explorateur des donjons|phb} or (b) an {@item Pack d'explorateur|phb}":
		"(a) un {@item Pack d'explorateur des donjons|phb} ou (b) un {@item Pack d'explorateur|phb}",
	"{@i Choose A, B, or C:} (A) {@item Cotte de mailles|XPHB}, {@item Épée à deux mains|XPHB}, {@item Fléau d'armes|XPHB}, 8 {@item Javelot|XPHB|Javelins}, {@item Pack d'explorateur des donjons|XPHB}, and 4 GP; (B) {@item Armure de cuir clouté|XPHB}, {@item Cimeterre|XPHB}, {@item Épée courte|XPHB}, {@item Arc long|XPHB}, {@item Flèches (20)|XPHB|20 Arrows}, {@item Carquois|XPHB}, {@item Pack d'explorateur des donjons|XPHB}, and 11 GP; or (C) 155 GP":
		"{@i Choisissez A, B ou C :} (A) une {@item Cotte de mailles|XPHB}, une {@item Épée à deux mains|XPHB}, un {@item Fléau d'armes|XPHB}, 8 {@item Javelot|XPHB|javelots}, un {@item Pack d'explorateur des donjons|XPHB} et 4 PO ; (B) une {@item Armure de cuir clouté|XPHB}, un {@item Cimeterre|XPHB}, une {@item Épée courte|XPHB}, un {@item Arc long|XPHB}, {@item Flèches (20)|XPHB|20 flèches}, un {@item Carquois|XPHB}, un {@item Pack d'explorateur des donjons|XPHB} et 11 PO ; ou (C) 155 PO",

	// PHB class features
	"You adopt a particular style of fighting as your specialty. Choose one of the following options. You can't take the same Fighting Style option more than once, even if you get to choose again.":
		"Vous adoptez un style de combat particulier comme spécialité. Choisissez l'une des options suivantes. Vous ne pouvez pas prendre deux fois la même option de Style de combat, même si vous pouvez choisir de nouveau.",
	"You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to {@dice 1d10} + your fighter level.":
		"Vous disposez d'une réserve d'endurance limitée sur laquelle vous pouvez compter pour vous protéger des dangers. Pendant votre tour, vous pouvez utiliser une action bonus pour récupérer des points de vie égaux à {@dice 1d10} + votre niveau de guerrier.",
	"Once you use this feature, you must finish a short or long rest before you can use it again.":
		"Une fois que vous avez utilisé cette capacité, vous devez terminer un repos court ou long avant de pouvoir l'utiliser à nouveau.",
	"Starting at 2nd level, you can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action.":
		"À partir du niveau 2, vous pouvez vous pousser au-delà de vos limites habituelles pendant un instant. Pendant votre tour, vous pouvez effectuer une action supplémentaire.",
	"Once you use this feature, you must finish a short or long rest before you can use it again. Starting at 17th level, you can use it twice before a rest, but only once on the same turn.":
		"Une fois que vous avez utilisé cette capacité, vous devez terminer un repos court ou long avant de pouvoir l'utiliser à nouveau. À partir du niveau 17, vous pouvez l'utiliser deux fois entre deux repos, mais une seule fois par tour.",
	"At 3rd level, you choose an archetype from the list available that you strive to emulate in your combat styles and techniques. The archetype you choose grants you features at 3rd level and again at 7th, 10th, 15th, and 18th level.":
		"Au niveau 3, vous choisissez un archétype dans la liste de ceux disponibles que vous vous efforcez d'émuler dans vos styles et techniques de combat. L'archétype que vous choisissez vous accorde des capacités au niveau 3, puis aux niveaux 7, 10, 15 et 18.",
	"When you reach 4th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.":
		"Lorsque vous atteignez le niveau 4, vous pouvez augmenter de 2 la valeur d'une caractéristique de votre choix, ou augmenter de 1 la valeur de deux caractéristiques de votre choix. Normalement, vous ne pouvez pas augmenter une valeur de caractéristique au-delà de 20 grâce à cette capacité.",
	"If your DM allows the use of feats, you may instead take a {@5etools feat|feats.html}.":
		"Si votre MJ autorise l'utilisation des dons, vous pouvez plutôt prendre un {@5etools don|feats.html}.",
	"{@i 4th-level fighter {@variantrule optional class features|tce|optional feature}}":
		"{@i Capacité de classe optionnelle de guerrier de niveau 4 {@variantrule Capacités de classe optionnelles|tce|capacité de classe optionnelle}}",
	"Whenever you reach a level in this class that grants the Ability Score Improvement feature, you can do one of the following, as you shift the focus of your martial practice:":
		"Chaque fois que vous atteignez un niveau dans cette classe qui accorde la capacité Amélioration de caractéristique, vous pouvez faire l'une des choses suivantes, à mesure que vous faites évoluer votre pratique martiale :",
	"Replace a {@filter fighting style|optionalfeatures|feature type=FS:F} you know with another fighting style available to fighters.":
		"Remplacer un {@filter style de combat|optionalfeatures|feature type=FS:F} que vous connaissez par un autre style de combat accessible aux guerriers.",
	"If you know any {@filter maneuvers|optionalfeatures|feature type=MV:B} from the {@class fighter|phb|Battle Master|Battle Master|phb|2-0} archetype, you can replace one maneuver you know with a different maneuver.":
		"Si vous connaissez des {@filter manœuvres|optionalfeatures|feature type=MV:B} de l'archétype {@class Fighter|phb|Maître de guerre|Battle Master|phb|2-0}, vous pouvez remplacer une manœuvre que vous connaissez par une autre.",
	"Beginning at 5th level, you can attack twice, instead of once, whenever you take the {@action Attaque} action on your turn.":
		"À partir du niveau 5, vous pouvez attaquer deux fois, au lieu d'une, chaque fois que vous utilisez l'action {@action Attaque} pendant votre tour.",
	"The number of attacks increases to three when you reach 11th level in this class and to four when you reach 20th level in this class.":
		"Le nombre d'attaques passe à trois lorsque vous atteignez le niveau 11 dans cette classe, et à quatre lorsque vous atteignez le niveau 20 dans cette classe.",
	"When you reach 6th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.":
		"Lorsque vous atteignez le niveau 6, vous pouvez augmenter de 2 la valeur d'une caractéristique de votre choix, ou augmenter de 1 la valeur de deux caractéristiques de votre choix. Normalement, vous ne pouvez pas augmenter une valeur de caractéristique au-delà de 20 grâce à cette capacité.",
	"At 7th level, you gain a feature granted by your Martial Archetype.":
		"Au niveau 7, vous obtenez une capacité accordée par votre Archétype martial.",
	"When you reach 8th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.":
		"Lorsque vous atteignez le niveau 8, vous pouvez augmenter de 2 la valeur d'une caractéristique de votre choix, ou augmenter de 1 la valeur de deux caractéristiques de votre choix. Normalement, vous ne pouvez pas augmenter une valeur de caractéristique au-delà de 20 grâce à cette capacité.",
	"Beginning at 9th level, you can reroll a saving throw that you fail. If you do so, you must use the new roll, and you can't use this feature again until you finish a long rest.":
		"À partir du niveau 9, vous pouvez relancer un jet de sauvegarde que vous avez raté. Si vous le faites, vous devez utiliser le nouveau résultat, et vous ne pouvez plus utiliser cette capacité avant d'avoir terminé un repos long.",
	"You can use this feature twice between long rests starting at 13th level and three times between long rests starting at 17th level.":
		"Vous pouvez utiliser cette capacité deux fois entre deux repos longs à partir du niveau 13, et trois fois entre deux repos longs à partir du niveau 17.",
	"At 10th level, you gain a feature granted by your Martial Archetype.":
		"Au niveau 10, vous obtenez une capacité accordée par votre Archétype martial.",
	"At 11th level, you can attack three times whenever you take the {@action Attaque} action on your turn.":
		"Au niveau 11, vous pouvez attaquer trois fois chaque fois que vous utilisez l'action {@action Attaque} pendant votre tour.",
	"When you reach 12th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.":
		"Lorsque vous atteignez le niveau 12, vous pouvez augmenter de 2 la valeur d'une caractéristique de votre choix, ou augmenter de 1 la valeur de deux caractéristiques de votre choix. Normalement, vous ne pouvez pas augmenter une valeur de caractéristique au-delà de 20 grâce à cette capacité.",
	"At 13th level, you can use Indomitable twice between long rests.":
		"Au niveau 13, vous pouvez utiliser Indomptable deux fois entre deux repos longs.",
	"When you reach 14th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.":
		"Lorsque vous atteignez le niveau 14, vous pouvez augmenter de 2 la valeur d'une caractéristique de votre choix, ou augmenter de 1 la valeur de deux caractéristiques de votre choix. Normalement, vous ne pouvez pas augmenter une valeur de caractéristique au-delà de 20 grâce à cette capacité.",
	"At 15th level, you gain a feature granted by your Martial Archetype.":
		"Au niveau 15, vous obtenez une capacité accordée par votre Archétype martial.",
	"When you reach 16th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.":
		"Lorsque vous atteignez le niveau 16, vous pouvez augmenter de 2 la valeur d'une caractéristique de votre choix, ou augmenter de 1 la valeur de deux caractéristiques de votre choix. Normalement, vous ne pouvez pas augmenter une valeur de caractéristique au-delà de 20 grâce à cette capacité.",
	"At 17th level, you can use Action Surge twice before a rest, but only once on the same turn.":
		"Au niveau 17, vous pouvez utiliser Explosion d'action deux fois entre deux repos, mais une seule fois par tour.",
	"At 17th level, you can use Indomitable three times between long rests.":
		"Au niveau 17, vous pouvez utiliser Indomptable trois fois entre deux repos longs.",
	"At 18th level, you gain a feature granted by your Martial Archetype.":
		"Au niveau 18, vous obtenez une capacité accordée par votre Archétype martial.",
	"When you reach 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.":
		"Lorsque vous atteignez le niveau 19, vous pouvez augmenter de 2 la valeur d'une caractéristique de votre choix, ou augmenter de 1 la valeur de deux caractéristiques de votre choix. Normalement, vous ne pouvez pas augmenter une valeur de caractéristique au-delà de 20 grâce à cette capacité.",
	"At 20th level, you can attack four times whenever you take the {@action Attaque} action on your turn.":
		"Au niveau 20, vous pouvez attaquer quatre fois chaque fois que vous utilisez l'action {@action Attaque} pendant votre tour.",

	// XPHB class features
	"You have honed your martial prowess and gain a {@filter Fighting Style feat|feats|category=FS} of your choice. {@feat Défense|XPHB} is recommended.":
		"Vous avez aiguisé votre prouesse martiale et obtenez un {@filter don de style de combat|feats|category=FS} de votre choix. {@feat Défense|XPHB} est recommandé.",
	"Whenever you gain a Fighter level, you can replace the feat you chose with a different {@filter Fighting Style feat|feats|category=FS}.":
		"Chaque fois que vous gagnez un niveau de Guerrier, vous pouvez remplacer le don que vous avez choisi par un autre {@filter don de style de combat|feats|category=FS}.",
	"You have a limited well of physical and mental stamina that you can draw on. As a {@variantrule Bonus Action|XPHB}, you can use it to regain {@variantrule Hit Points|XPHB} equal to {@dice 1d10} plus your Fighter level.":
		"Vous disposez d'une réserve limitée d'énergie physique et mentale sur laquelle vous pouvez compter. À titre d'{@variantrule Action bonus|XPHB|action bonus}, vous pouvez l'utiliser pour récupérer des {@variantrule Points de vie|XPHB|points de vie} égaux à {@dice 1d10} plus votre niveau de Guerrier.",
	"You can use this feature twice. You regain one expended use when you finish a {@variantrule Short Rest|XPHB}, and you regain all expended uses when you finish a {@variantrule Long Rest|XPHB}.":
		"Vous pouvez utiliser cette capacité deux fois. Vous récupérez une utilisation dépensée lorsque vous terminez un {@variantrule Repos court|XPHB|repos court}, et toutes les utilisations dépensées lorsque vous terminez un {@variantrule Repos long|XPHB|repos long}.",
	"When you reach certain Fighter levels, you gain more uses of this feature, as shown in the Second Wind column of the Fighter Features table.":
		"Lorsque vous atteignez certains niveaux de Guerrier, vous gagnez des utilisations supplémentaires de cette capacité, comme l'indique la colonne Second souffle de la table Capacités du Guerrier.",
	"Your training with weapons allows you to use the {@variantrule weapon mastery properties|XPHB|mastery properties} of three kinds of {@filter Simple|items|type=simple weapon} or {@filter Martial|items|type=martial weapon} weapons of your choice. Whenever you finish a {@variantrule Long Rest|XPHB}, you can practice weapon drills and change one of those weapon choices.":
		"Votre entraînement aux armes vous permet d'utiliser les {@variantrule weapon mastery properties|XPHB|propriétés de maîtrise} de trois types d'armes de votre choix, {@filter courantes|items|type=simple weapon} ou {@filter de guerre|items|type=martial weapon}. Chaque fois que vous terminez un {@variantrule Repos long|XPHB|repos long}, vous pouvez effectuer des exercices d'armes et modifier l'un de ces choix d'armes.",
	"When you reach certain Fighter levels, you gain the ability to use the {@variantrule weapon mastery properties|XPHB|mastery properties} of more kinds of weapons, as shown in the Weapon Mastery column of the Fighter Features table.":
		"Lorsque vous atteignez certains niveaux de Guerrier, vous gagnez la capacité d'utiliser les {@variantrule weapon mastery properties|XPHB|propriétés de maîtrise} d'un plus grand nombre de types d'armes, comme l'indique la colonne Maîtrise des armes de la table Capacités du Guerrier.",
	"You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action, except the {@action Magie|XPHB} action.":
		"Vous pouvez vous pousser au-delà de vos limites habituelles pendant un instant. Pendant votre tour, vous pouvez effectuer une action supplémentaire, à l'exception de l'action {@action Magie|XPHB}.",
	"Once you use this feature, you can't do so again until you finish a {@variantrule Short Rest|XPHB|Short} or {@variantrule Long Rest|XPHB}. Starting at level 17, you can use it twice before a rest but only once on a turn.":
		"Une fois que vous avez utilisé cette capacité, vous ne pouvez plus le faire avant d'avoir terminé un {@variantrule Repos court|XPHB|repos court} ou un {@variantrule Repos long|XPHB|repos long}. À partir du niveau 17, vous pouvez l'utiliser deux fois entre deux repos, mais une seule fois par tour.",
	"You have a mind for tactics on and off the battlefield. When you fail an ability check, you can expend a use of your Second Wind to push yourself toward success. Rather than regaining {@variantrule Hit Points|XPHB}, you roll {@dice 1d10} and add the number rolled to the ability check, potentially turning it into a success. If the check still fails, this use of Second Wind isn't expended.":
		"Vous avez l'esprit tactique, sur le champ de bataille comme en dehors. Lorsque vous ratez un test de caractéristique, vous pouvez dépenser une utilisation de votre Second souffle pour vous rapprocher de la réussite. Au lieu de récupérer des {@variantrule Points de vie|XPHB|points de vie}, vous lancez un {@dice 1d10} et ajoutez le résultat au test de caractéristique, pouvant ainsi le transformer en réussite. Si le test échoue tout de même, cette utilisation de Second souffle n'est pas dépensée.",
	"You gain a Fighter subclass of your choice. A subclass is a specialization that grants you features at certain Fighter levels. For the rest of your career, you gain each of your subclass's features that are of your Fighter level or lower.":
		"Vous gagnez une sous-classe de guerrier de votre choix. Une sous-classe est une spécialisation qui vous accorde des capacités à certains niveaux de Guerrier. Pour le reste de votre carrière, vous gagnez chacune des capacités de votre sous-classe dont le niveau est inférieur ou égal à votre niveau de Guerrier.",
	"You gain the {@feat Amélioration de caractéristique|XPHB} feat or another {@5etools feat|feats.html} of your choice for which you qualify. You gain this feature again at Fighter levels 6, 8, 12, 14, and 16.":
		"Vous gagnez le don {@feat Amélioration de caractéristique|XPHB} ou un autre {@5etools don|feats.html} de votre choix pour lequel vous êtes admissible. Vous gagnez à nouveau cette capacité aux niveaux de Guerrier 6, 8, 12, 14 et 16.",
	"You gain the {@feat Amélioration de caractéristique|XPHB} feat or another {@5etools feat|feats.html} of your choice for which you qualify.":
		"Vous gagnez le don {@feat Amélioration de caractéristique|XPHB} ou un autre {@5etools don|feats.html} de votre choix pour lequel vous êtes admissible.",
	"You can attack twice instead of once whenever you take the {@action Attaque|XPHB} action on your turn.":
		"Vous pouvez attaquer deux fois au lieu d'une chaque fois que vous utilisez l'action {@action Attaque|XPHB} pendant votre tour.",
	"Whenever you activate your Second Wind with a {@variantrule Bonus Action|XPHB}, you can move up to half your {@variantrule Speed|XPHB} without provoking {@action Attaque d'opportunité|XPHB|Opportunity Attacks}.":
		"Chaque fois que vous activez votre Second souffle avec une {@variantrule Action bonus|XPHB|action bonus}, vous pouvez vous déplacer sur la moitié de votre {@variantrule Speed|XPHB|vitesse} au maximum sans provoquer d'{@action Attaque d'opportunité|XPHB|attaques d'opportunité}.",
	"You gain a feature from your Fighter Subclass.":
		"Vous gagnez une capacité de votre Sous-classe de guerrier.",
	"If you fail a saving throw, you can reroll it with a bonus equal to your Fighter level. You must use the new roll, and you can't use this feature again until you finish a {@variantrule Long Rest|XPHB}.":
		"Si vous ratez un jet de sauvegarde, vous pouvez le relancer avec un bonus égal à votre niveau de Guerrier. Vous devez utiliser le nouveau résultat, et vous ne pouvez plus utiliser cette capacité avant d'avoir terminé un {@variantrule Repos long|XPHB|repos long}.",
	"You can use this feature twice before a {@variantrule Long Rest|XPHB} starting at level 13 and three times before a {@variantrule Long Rest|XPHB} starting at level 17.":
		"Vous pouvez utiliser cette capacité deux fois avant un {@variantrule Repos long|XPHB|repos long} à partir du niveau 13, et trois fois avant un {@variantrule Repos long|XPHB|repos long} à partir du niveau 17.",
	"When you attack with a weapon whose mastery property you can use, you can replace that property with the {@itemMastery Push|XPHB}, {@itemMastery Sap|XPHB}, or {@itemMastery Slow|XPHB} property for that attack.":
		"Lorsque vous attaquez avec une arme dont vous pouvez utiliser la propriété de maîtrise, vous pouvez remplacer cette propriété par {@itemMastery Push|XPHB|Repousser}, {@itemMastery Sap|XPHB|Amorti} ou {@itemMastery Slow|XPHB|Freiner} pour cette attaque.",
	"You can attack three times instead of once whenever you take the {@action Attaque|XPHB} action on your turn.":
		"Vous pouvez attaquer trois fois au lieu d'une chaque fois que vous utilisez l'action {@action Attaque|XPHB} pendant votre tour.",
	"You study your opponents and learn from each attack you make. If you make an attack roll against a creature and miss, you have {@variantrule Advantage|XPHB} on your next attack roll against that creature before the end of your next turn.":
		"Vous étudiez vos adversaires et apprenez de chaque attaque que vous effectuez. Si vous effectuez un jet d'attaque contre une créature et le manquez, vous avez un {@variantrule Advantage|XPHB|avantage} sur votre prochain jet d'attaque contre cette créature avant la fin de votre prochain tour.",
	"You gain an {@filter Epic Boon feat|feats|category=EB} or another {@5etools feat|feats.html} of your choice for which you qualify. {@feat Don de la prouesse au combat|XPHB} is recommended.":
		"Vous gagnez un {@filter don épique|feats|category=EB} ou un autre {@5etools don|feats.html} de votre choix pour lequel vous êtes admissible. {@feat Don de la prouesse au combat|XPHB} est recommandé.",
	"You can attack four times instead of once whenever you take the {@action Attaque|XPHB} action on your turn.":
		"Vous pouvez attaquer quatre fois au lieu d'une chaque fois que vous utilisez l'action {@action Attaque|XPHB} pendant votre tour.",

	// Echo Knight (EGW)
	"A mysterious and feared frontline warrior of the Kryn Dynasty, the Echo Knight has mastered the art of using dunamis to summon the fading shades of unrealized timelines to aid them in battle. Surrounded by echoes of their own might, they charge into the fray as a cycling swarm of shadows and strikes.":
		"Guerrier de première ligne mystérieux et redouté de la dynastie Kryn, le Chevalier d'écho a maîtrisé l'art d'utiliser la dunamis pour invoquer les ombres évanescentes de chronologies inabouties afin de l'aider au combat. Entouré d'échos de sa propre puissance, il se jette dans la mêlée tel un tourbillon d'ombres et de frappes.",
	"{@i 3rd-level Echo Knight feature}": "{@i Capacité de Chevalier d'écho de niveau 3}",
	"You can use a bonus action to magically manifest an echo of yourself in an unoccupied space you can see within 15 feet of you. This echo is a magical, translucent, gray image of you that lasts until it is destroyed, until you dismiss it as a bonus action, until you manifest another echo, or until you're {@condition Incapable}.":
		"Vous pouvez utiliser une action bonus pour faire apparaître par magie un écho de vous-même dans un espace inoccupé que vous pouvez voir à 4,5 mètres de vous ou moins. Cet écho est une image de vous, grise et translucide, magique, qui dure jusqu'à ce qu'elle soit détruite, que vous la congédiiez à titre d'action bonus, que vous fassiez apparaître un autre écho, ou que vous soyez {@condition Incapable}.",
	"Your echo has AC 14 + your proficiency bonus, 1 hit point, and immunity to all conditions. If it has to make a saving throw, it uses your saving throw bonus for the roll. It is the same size as you, and it occupies its space. On your turn, you can mentally command the echo to move up to 30 feet in any direction (no action required). If your echo is ever more than 30 feet from you at the end of your turn, it is destroyed.":
		"Votre écho a une CA de 14 + votre bonus de maîtrise, 1 point de vie, et il est immunisé contre tous les états. S'il doit faire un jet de sauvegarde, il utilise votre bonus de sauvegarde pour le jet. Il est de la même taille que vous et il occupe son espace. Pendant votre tour, vous pouvez commander mentalement à l'écho de se déplacer sur 9 mètres au maximum dans n'importe quelle direction (aucune action requise). Si votre écho se trouve à plus de 9 mètres de vous à la fin de votre tour, il est détruit.",
	"You can use the echo in the following ways:":
		"Vous pouvez utiliser l'écho des manières suivantes :",
	"As a bonus action, you can teleport, magically swapping places with your echo at a cost of 15 feet of your movement, regardless of the distance between the two of you.":
		"À titre d'action bonus, vous pouvez vous téléporter, en échangeant magiquement votre place avec votre écho pour un coût de 1,5 mètre de votre déplacement, quelle que soit la distance qui vous sépare.",
	"When you take the {@action Attaque} action on your turn, any attack you make with that action can originate from your space or the echo's space. You make this choice for each attack.":
		"Lorsque vous utilisez l'action {@action Attaque} pendant votre tour, toute attaque que vous effectuez avec cette action peut provenir de votre espace ou de celui de l'écho. Vous faites ce choix pour chaque attaque.",
	"When a creature that you can see within 5 feet of your echo moves at least 5 feet away from it, you can use your reaction to make an opportunity attack against that creature as if you were in the echo's space.":
		"Lorsqu'une créature que vous pouvez voir à 1,5 mètre de votre écho ou moins s'éloigne d'au moins 1,5 mètre de lui, vous pouvez utiliser votre réaction pour effectuer une attaque d'opportunité contre cette créature comme si vous occupiez l'espace de l'écho.",
	"You can heighten your echo's fury. Whenever you take the {@action Attaque} action, you can make one additional melee attack from the echo's position.":
		"Vous pouvez décupler la fureur de votre écho. Chaque fois que vous utilisez l'action {@action Attaque}, vous pouvez effectuer une attaque au corps à corps supplémentaire depuis la position de l'écho.",
	"You can use this feature a number of times equal to your Constitution modifier (a minimum of once). You regain all expended uses when you finish a long rest.":
		"Vous pouvez utiliser cette capacité un nombre de fois égal à votre modificateur de Constitution (minimum une fois). Vous récupérez toutes les utilisations dépensées lorsque vous terminez un repos long.",
	"{@i 7th-level Echo Knight feature}": "{@i Capacité de Chevalier d'écho de niveau 7}",
	"You can temporarily transfer your consciousness to your echo. As an action, you can see through your echo's eyes and hear through its ears. During this time, you are {@condition Assourdi} and {@condition Aveuglé}. You can sustain this effect for up to 10 minutes, and you can end it at any time (requires no action). While your echo is being used in this way, it can be up to 1,000 feet away from you without being destroyed.":
		"Vous pouvez transférer temporairement votre conscience dans votre écho. À titre d'action, vous pouvez voir à travers les yeux de votre écho et entendre à travers ses oreilles. Pendant ce temps, vous êtes {@condition Assourdi} et {@condition Aveuglé}. Vous pouvez maintenir cet effet pendant 10 minutes au maximum, et vous pouvez y mettre fin à tout moment (aucune action requise). Tant que votre écho est utilisé de cette manière, il peut se trouver jusqu'à 300 mètres de vous sans être détruit.",
	"{@i 10th-level Echo Knight feature}": "{@i Capacité de Chevalier d'écho de niveau 10}",
	"You can make your echo throw itself in front of an attack directed at another creature that you can see. Before the attack roll is made, you can use your reaction to teleport the echo to an unoccupied space within 5 feet of the targeted creature. The attack roll that triggered the reaction is instead made against your echo.":
		"Vous pouvez pousser votre écho à se jeter devant une attaque dirigée contre une autre créature que vous pouvez voir. Avant que le jet d'attaque ne soit effectué, vous pouvez utiliser votre réaction pour téléporter l'écho dans un espace inoccupé à 1,5 mètre ou moins de la créature visée. Le jet d'attaque qui a déclenché la réaction est alors effectué contre votre écho.",
	"Once you use this feature, you can't use it again until you finish a short or long rest.":
		"Une fois que vous avez utilisé cette capacité, vous ne pouvez plus l'utiliser avant d'avoir terminé un repos court ou long.",
	"{@i 15th-level Echo Knight feature}": "{@i Capacité de Chevalier d'écho de niveau 15}",
	"You've learned to absorb the fleeting magic of your echo. When an echo of yours is destroyed by taking damage, you can gain a number of temporary hit points equal to {@dice 2d6} + your Constitution modifier, provided you don't already have temporary hit points.":
		"Vous avez appris à absorber la magie fugace de votre écho. Lorsqu'un de vos échos est détruit en subissant des dégâts, vous pouvez gagner un nombre de points de vie temporaires égal à {@dice 2d6} + votre modificateur de Constitution, à condition de ne pas avoir déjà de points de vie temporaires.",
	"{@i 18th-level Echo Knight feature}": "{@i Capacité de Chevalier d'écho de niveau 18}",
	"You can use a bonus action to create two echoes with your Manifest Echo feature, and these echoes can coexist. If you try to create a third echo, the previous two echoes are destroyed. Anything you can do from one echo's position can be done from the other's instead.":
		"Vous pouvez utiliser une action bonus pour créer deux échos grâce à votre capacité Manifestation d'écho, et ces échos peuvent coexister. Si vous essayez de créer un troisième écho, les deux échos précédents sont détruits. Tout ce que vous pouvez faire depuis la position d'un écho peut être fait à la place depuis celle de l'autre.",
	"In addition, when you roll initiative and have no uses of your Unleash Incarnation feature left, you regain one use of that feature.":
		"En outre, lorsque vous faites un jet d'initiative et qu'il ne vous reste aucune utilisation de votre capacité Incarnation déchaînée, vous en récupérez une.",

	// Battle Master (PHB)
	"Those who emulate the archetypal Battle Master employ martial techniques passed down through generations. To a Battle Master, combat is an academic field, sometimes including subjects beyond battle such as weaponsmithing and calligraphy. Not every fighter absorbs the lessons of history, theory, and artistry that are reflected in the Battle Master archetype, but those who do are well-rounded fighters of great skill and knowledge.":
		"Ceux qui émulent l'archétype du Maître de guerre emploient des techniques martiales transmises de génération en génération. Pour un Maître de guerre, le combat est un domaine d'étude, comprenant parfois des sujets qui vont au-delà de la bataille, comme la fabrication d'armes ou la calligraphie. Tous les guerriers n'assimilent pas les leçons d'histoire, de théorie et d'esthétique que reflète l'archétype du Maître de guerre, mais ceux qui le font deviennent des guerriers complets, d'une grande compétence et d'un grand savoir.",
	"When you choose this archetype at 3rd level, you learn maneuvers that are fueled by special dice called superiority dice.":
		"Lorsque vous choisissez cet archétype au niveau 3, vous apprenez des manœuvres alimentées par des dés spéciaux appelés dés de supériorité.",
	"You learn three maneuvers of your choice, which are listed under \\\"Maneuvers\\\" below. Many maneuvers enhance an attack in some way. You can use only one maneuver per attack.":
		"Vous apprenez trois manœuvres de votre choix, listées sous « Manœuvres » ci-dessous. Nombreuses sont les manœuvres qui augmentent d'une façon ou d'une autre une attaque. Vous ne pouvez utiliser qu'une seule manœuvre par attaque.",
	"You learn two additional maneuvers of your choice at 7th, 10th, and 15th level. Each time you learn new maneuvers, you can also replace one maneuver you know with a different one.":
		"Vous apprenez deux manœuvres supplémentaires de votre choix aux niveaux 7, 10 et 15. Chaque fois que vous apprenez de nouvelles manœuvres, vous pouvez également remplacer une manœuvre que vous connaissez par une autre.",
	"You have four superiority dice, which are {@dice d8}s. A superiority die is expended when you use it. You regain all of your expended superiority dice when you finish a short or long rest.":
		"Vous possédez quatre dés de supériorité, qui sont des {@dice d8}. Un dé de supériorité est dépensé quand vous l'utilisez. Vous récupérez tous vos dés de supériorité dépensés lorsque vous terminez un repos court ou long.",
	"You gain another superiority die at 7th level and one more at 15th level.":
		"Vous gagnez un autre dé de supériorité au niveau 7, et un de plus au niveau 15.",
	"Some of your maneuvers require your target to make a saving throw to resist the maneuver's effects. The saving throw DC is calculated as follows:":
		"Certaines de vos manœuvres obligent votre cible à faire un jet de sauvegarde pour résister aux effets de la manœuvre. Le DD de la sauvegarde est calculé comme suit :",
	"{@i 3rd-level fighter {@variantrule optional class features|tce|optional feature}}":
		"{@i Capacité de classe optionnelle de guerrier de niveau 3 {@variantrule Capacités de classe optionnelles|tce|capacité de classe optionnelle}}",
	"If you have access to maneuvers, the following maneuvers are added to the list of options available to you. Maneuvers are available to Battle Masters but also to characters who have a special feature like the {@optfeature Superior Technique|TCE} fighting style or the {@feat Adepte martial} feat.":
		"Si vous avez accès aux manœuvres, les manœuvres suivantes s'ajoutent à la liste des options qui s'offrent à vous. Les manœuvres sont accessibles aux Maîtres de guerre, mais aussi aux personnages dotés d'une capacité spéciale comme le style de combat {@optfeature Superior Technique|TCE} ou le don {@feat Adepte martial}.",
	"The maneuvers are presented in alphabetical order.":
		"Les manœuvres sont présentées par ordre alphabétique.",
	"At 3rd level, you gain proficiency with one type of {@filter artisan's tools|items|source=phb|miscellaneous=mundane|type=artisan's tools} of your choice.":
		"Au niveau 3, vous gagnez la maîtrise d'un type d'{@filter outils d'artisan|items|source=phb|miscellaneous=mundane|type=artisan's tools} de votre choix.",
	"At 7th level, you learn two additional maneuvers of your choice.":
		"Au niveau 7, vous apprenez deux manœuvres supplémentaires de votre choix.",
	"You gain another superiority die at 7th level.":
		"Vous gagnez un autre dé de supériorité au niveau 7.",
	"If you spend at least 1 minute observing or interacting with another creature outside combat, you can learn certain information about its capabilities compared to your own. The DM tells you if the creature is your equal, superior, or inferior in regard to two of the following characteristics of your choice:":
		"Si vous consacrez au moins 1 minute à observer une autre créature ou à interagir avec elle hors combat, vous pouvez apprendre certaines informations sur ses capacités comparées aux vôtres. Le MJ vous indique si la créature est votre égale, votre supérieure ou votre inférieure pour deux des caractéristiques suivantes, selon votre choix :",
	"Strength score": "Valeur de Force",
	"Dexterity score": "Valeur de Dextérité",
	"Constitution score": "Valeur de Constitution",
	"Armor Class": "Classe d'armure",
	"Current hit points": "Points de vie actuels",
	"Total class levels (if any)": "Niveaux de classe totaux (le cas échéant)",
	"Fighter class levels (if any)": "Niveaux de classe de guerrier (le cas échéant)",
	"At 10th level, you learn two additional maneuvers of your choice.":
		"Au niveau 10, vous apprenez deux manœuvres supplémentaires de votre choix.",
	"At 10th level, your superiority dice turn into {@dice d10}s.":
		"Au niveau 10, vos dés de supériorité deviennent des {@dice d10}.",
	"At 15th level, you learn two additional maneuvers of your choice.":
		"Au niveau 15, vous apprenez deux manœuvres supplémentaires de votre choix.",
	"You gain another superiority die at 15th level.":
		"Vous gagnez un autre dé de supériorité au niveau 15.",
	"Starting at 15th level, when you roll initiative and have no superiority dice remaining, you regain 1 superiority die.":
		"À partir du niveau 15, lorsque vous faites un jet d'initiative et qu'il ne vous reste aucun dé de supériorité, vous récupérez 1 dé de supériorité.",
	"At 18th level, your superiority dice turn into {@dice d12}s.":
		"Au niveau 18, vos dés de supériorité deviennent des {@dice d12}.",

	// Champion (PHB)
	"The archetypal Champion focuses on the development of raw physical power honed to deadly perfection. Those who model themselves on this archetype combine rigorous training with physical excellence to deal devastating blows.":
		"Le Champion, dans sa forme archétypale, se concentre sur le développement d'une puissance physique brute forgée jusqu'à la perfection mortelle. Ceux qui se conforment à cet archétype allient entraînement rigoureux et excellence physique pour porter des coups dévastateurs.",
	"Beginning when you choose this archetype at 3rd level, your weapon attacks score a critical hit on a roll of 19 or 20.":
		"À partir du moment où vous choisissez cet archétype au niveau 3, vos attaques avec une arme infligent un coup critique sur un jet de 19 ou 20.",
	"Starting at 7th level, you can add half your proficiency bonus (round up) to any Strength, Dexterity, or Constitution check you make that doesn't already use your proficiency bonus.":
		"À partir du niveau 7, vous pouvez ajouter la moitié de votre bonus de maîtrise (arrondie à l'unité supérieure) à tout test de Force, de Dextérité ou de Constitution que vous effectuez et qui n'utilise pas déjà votre bonus de maîtrise.",
	"In addition, when you make a running long jump, the distance you can cover increases by a number of feet equal to your Strength modifier.":
		"En outre, lorsque vous effectuez un saut en longueur avec élan, la distance que vous pouvez parcourir augmente d'un nombre de mètres égal à votre modificateur de Force.",
	"At 10th level, you can choose a second option from the Fighting Style class feature.":
		"Au niveau 10, vous pouvez choisir une deuxième option parmi la capacité de classe Style de combat.",
	"Starting at 15th level, your weapon attacks score a critical hit on a roll of 18-20.":
		"À partir du niveau 15, vos attaques avec une arme infligent un coup critique sur un jet de 18 à 20.",
	"At 18th level, you attain the pinnacle of resilience in battle. At the start of each of your turns, you regain hit points equal to 5 + your Constitution modifier if you have no more than half of your hit points left. You don't gain this benefit if you have 0 hit points.":
		"Au niveau 18, vous atteignez le sommet de la résilience au combat. Au début de chacun de vos tours, vous récupérez des points de vie égaux à 5 + votre modificateur de Constitution s'il ne vous reste plus que la moitié de vos points de vie ou moins. Vous ne bénéficiez pas de cet avantage si vous avez 0 point de vie.",

	// Eldritch Knight (PHB)
	"The archetypal Eldritch Knight combines the martial mastery common to all fighters with a careful study of magic. Eldritch Knights use magical techniques similar to those practiced by wizards. They focus their study on two of the eight schools of magic\u2014abjuration and evocation. Abjuration spells grant an Eldritch Knight additional protection in battle, and evocation spells deal damage to many foes at once, extending the fighter's reach in combat. These knights learn a comparatively small number of spells, committing them to memory instead of keeping them in a spellbook.":
		"Le Magelame, dans sa forme archétypale, allie la maîtrise martiale commune à tous les guerriers à une étude minutieuse de la magie. Les Magelames utilisent des techniques magiques similaires à celles pratiquées par les magiciens. Ils concentrent leur étude sur deux des huit écoles de magie : l'abjuration et l'évocation. Les sorts d'abjuration apportent au Magelame une protection supplémentaire au combat, tandis que les sorts d'évocation infligent des dégâts à de nombreux ennemis à la fois, étendant la portée du guerrier dans la bataille. Ces chevaliers apprennent un nombre relativement restreint de sorts, qu'ils mémorisent au lieu de les conserver dans un grimoire.",
	"When you reach 3rd level, you augment your martial prowess with the ability to cast spells. See {@book chapter 10|PHB|10} for the general rules of spellcasting and {@book chapter 11|PHB|11} for the {@filter wizard spell list|spells|class=wizard}.":
		"Quand vous atteignez le niveau 3, vous augmentez votre prouesse martiale de la capacité de lancer des sorts. Consultez le {@book chapitre 10|PHB|10} pour les règles générales du lancement de sorts et le {@book chapitre 11|PHB|11} pour la {@filter liste de sorts de magicien|spells|class=wizard}.",
	"You learn two cantrips of your choice from the {@filter wizard spell list|spells|class=wizard}. You learn an additional wizard cantrip of your choice at 10th level.":
		"Vous apprenez deux tours de magie de votre choix dans la {@filter liste de sorts de magicien|spells|class=wizard}. Vous apprenez un tour de magie de magicien supplémentaire de votre choix au niveau 10.",
	"The Eldritch Knight Spellcasting table shows how many spell slots you have to cast your {@filter wizard spells|spells|class=wizard} of 1st level and higher. To cast one of these spells, you must expend a slot of the spell's level or higher. You regain all expended spell slots when you finish a long rest.":
		"La table Lancement de sorts du Magelame indique combien d'emplacements de sorts vous avez pour lancer vos {@filter sorts de magicien|spells|class=wizard} de niveau 1 ou supérieur. Pour lancer l'un de ces sorts, vous devez dépenser un emplacement du niveau du sort ou supérieur. Vous récupérez tous les emplacements de sorts dépensés lorsque vous terminez un repos long.",
	"For example, if you know the 1st-level spell {@spell shield} and have a 1st-level and a 2nd-level spell slot available, you can cast {@spell shield} using either slot.":
		"Par exemple, si vous connaissez le sort de niveau 1 {@spell shield} et que vous disposez d'un emplacement de sort de niveau 1 et d'un de niveau 2, vous pouvez lancer {@spell shield} avec l'un ou l'autre emplacement.",
	"You know three 1st-level wizard spells of your choice, two of which you must choose from the abjuration and evocation spells on the wizard spell list.":
		"Vous connaissez trois sorts de magicien de niveau 1 de votre choix, dont deux doivent être choisis parmi les sorts d'abjuration et d'évocation de la liste de sorts de magicien.",
	"The Spells Known column of the Eldritch Knight Spellcasting table shows when you learn more wizard spells of 1st level or higher. Each of these spells must be an abjuration or evocation spell of your choice, and must be of a level for which you have spell slots. For instance, when you reach 7th level in this class, you can learn one new spell of 1st or 2nd level.":
		"La colonne Sorts connus de la table Lancement de sorts du Magelame indique quand vous apprenez de nouveaux sorts de magicien de niveau 1 ou supérieur. Chacun de ces sorts doit être un sort d'abjuration ou d'évocation de votre choix, et doit être d'un niveau pour lequel vous avez des emplacements de sorts. Par exemple, quand vous atteignez le niveau 7 dans cette classe, vous pouvez apprendre un nouveau sort de niveau 1 ou 2.",
	"The spells you learn at 8th, 14th, and 20th level can come from any school of magic.":
		"Les sorts que vous apprenez aux niveaux 8, 14 et 20 peuvent provenir de n'importe quelle école de magie.",
	"Whenever you gain a level in this class, you can replace one of the wizard spells you know with another spell of your choice from the wizard spell list. The new spell must be of a level for which you have spell slots, and it must be an abjuration or evocation spell, unless you're replacing the spell you gained at 3rd, 8th, 14th, or 20th level from any school of magic.":
		"Chaque fois que vous gagnez un niveau dans cette classe, vous pouvez remplacer l'un des sorts de magicien que vous connaissez par un autre sort de votre choix issu de la liste de sorts de magicien. Le nouveau sort doit être d'un niveau pour lequel vous avez des emplacements de sorts, et doit être un sort d'abjuration ou d'évocation, sauf si vous remplacez le sort gagné aux niveaux 3, 8, 14 ou 20, qui peut provenir de n'importe quelle école de magie.",
	"Intelligence is your spellcasting ability for your wizard spells, since you learn your spells through study and memorization. You use your Intelligence whenever a spell refers to your spellcasting ability. In addition, you use your Intelligence modifier when setting the saving throw DC for a wizard spell you cast and when making an attack roll with one.":
		"L'Intelligence est votre caractéristique de lancement de sorts pour vos sorts de magicien, puisque vous apprenez vos sorts par l'étude et la mémorisation. Vous utilisez votre Intelligence chaque fois qu'un sort se réfère à votre caractéristique de lancement de sorts. En outre, vous utilisez votre modificateur d'Intelligence pour déterminer le DD de sauvegarde d'un sort de magicien que vous lancez et pour effectuer un jet d'attaque avec l'un d'eux.",
	"At 3rd level, you learn a ritual that creates a magical bond between yourself and one weapon. You perform the ritual over the course of 1 hour, which can be done during a short rest. The weapon must be within your reach throughout the ritual, at the conclusion of which you touch the weapon and forge the bond.":
		"Au niveau 3, vous apprenez un rituel qui crée un lien magique entre vous et une arme. Vous accomplissez le rituel pendant 1 heure, ce qui peut être fait pendant un repos court. L'arme doit être à votre portée pendant toute la durée du rituel, à la fin duquel vous touchez l'arme et forgez le lien.",
	"Once you have bonded a weapon to yourself, you can't be disarmed of that weapon unless you are {@condition Incapable}. If it is on the same plane of existence, you can summon that weapon as a bonus action on your turn, causing it to teleport instantly to your hand.":
		"Une fois que vous avez lié une arme à vous-même, on ne peut pas vous désarmer de cette arme, sauf si vous êtes {@condition Incapable}. Si elle se trouve sur le même plan d'existence, vous pouvez invoquer cette arme à titre d'action bonus pendant votre tour, la faisant instantanément se téléporter dans votre main.",
	"You can have up to two bonded weapons, but can summon only one at a time with your bonus action. If you attempt to bond with a third weapon, you must break the bond with one of the other two.":
		"Vous pouvez avoir jusqu'à deux armes liées, mais vous ne pouvez en invoquer qu'une seule à la fois avec votre action bonus. Si vous essayez de créer un lien avec une troisième arme, vous devez rompre le lien avec l'une des deux autres.",
	"Beginning at 7th level, when you use your action to cast a cantrip, you can make one weapon attack as a bonus action.":
		"À partir du niveau 7, quand vous utilisez votre action pour lancer un tour de magie, vous pouvez effectuer une attaque avec une arme à titre d'action bonus.",
	"At 10th level, you learn how to make your weapon strikes undercut a creature's resistance to your spells. When you hit a creature with a weapon attack, that creature has disadvantage on the next saving throw it makes against a spell you cast before the end of your next turn.":
		"Au niveau 10, vous apprenez à faire en sorte que vos frappes d'arme minent la résistance d'une créature à vos sorts. Quand vous touchez une créature avec une attaque d'arme, cette créature a un désavantage au prochain jet de sauvegarde qu'elle effectue contre un sort que vous lancez avant la fin de votre prochain tour.",
	"At 15th level, you gain the ability to teleport up to 30 feet to an unoccupied space you can see when you use your Action Surge. You can teleport before or after the additional action.":
		"Au niveau 15, vous gagnez la capacité de vous téléporter sur 9 mètres au maximum vers un espace inoccupé que vous pouvez voir quand vous utilisez votre Explosion d'action. Vous pouvez vous téléporter avant ou après l'action supplémentaire.",
	"Starting at 18th level, when you use your action to cast a spell, you can make one weapon attack as a bonus action.":
		"À partir du niveau 18, quand vous utilisez votre action pour lancer un sort, vous pouvez effectuer une attaque avec une arme à titre d'action bonus.",

	// Purple Dragon Knight (SCAG)
	"Purple Dragon Knights are warriors who hail from the kingdom of Cormyr. Pledged to protect the crown, they take the fight against evil beyond the kingdom's borders. They are tasked with wandering the land as knights errant, relying on their judgment, bravery, and fidelity to guide them in defeating evildoers.":
		"Les Chevaliers du Dragon Pourpre sont des guerriers originaires du royaume de Cormyr. Liés par serment de protéger la couronne, ils mènent le combat contre le mal au-delà des frontières du royaume. Ils ont pour mission de parcourir le pays en chevaliers errants, comptant sur leur jugement, leur courage et leur loyauté pour les guider dans la défaite des malfaisants.",
	"A Purple Dragon Knight inspires greatness in others by committing brave deeds in battle. The mere presence of a knight in a hamlet is enough to cause some orcs and bandits to seek easier prey. A lone knight is a skilled warrior, but a knight leading a band of allies can transform even the most poorly equipped militia into a ferocious war band.":
		"Un Chevalier du Dragon Pourpre inspire la grandeur chez les autres en commettant des actes courageux au combat. La simple présence d'un chevalier dans un hameau suffit à pousser certains orques et bandits à chercher des proies plus faciles. Un chevalier solitaire est un guerrier compétent, mais un chevalier à la tête d'un groupe d'alliés peut transformer même la milice la plus mal équipée en une bande de guerre féroce.",
	"A knight prefers to lead through deeds, not words. As a knight spearheads an attack, the knight's actions can awaken reserves of courage and conviction in allies that they never suspected they had.":
		"Un chevalier préfère diriger par les actes plutôt que par les mots. Quand un chevalier mène une attaque, ses actions peuvent éveiller chez les alliés des réserves de courage et de conviction dont ils ne se doutaient même pas.",
	"When you choose this archetype at 3rd level, you learn how to inspire your allies to fight on past their injuries.":
		"Lorsque vous choisissez cet archétype au niveau 3, vous apprenez comment inspirer vos alliés pour qu'ils combattent au-delà de leurs blessures.",
	"When you use your Second Wind feature, you can choose up to three creatures within 60 feet of you that are allied with you. Each one regains hit points equal to your fighter level, provided that the creature can see or hear you.":
		"Lorsque vous utilisez votre capacité Second souffle, vous pouvez choisir jusqu'à trois créatures alliées dans un rayon de 18 mètres autour de vous. Chacune récupère des points de vie égaux à votre niveau de guerrier, à condition qu'elle puisse vous voir ou vous entendre.",
	"Purple Dragon Knights are tied to a specific order of Cormyrean knighthood.":
		"Les Chevaliers du Dragon Pourpre sont rattachés à un ordre précis de chevalerie cormyrienne.",
	"Banneret serves as the generic name for this archetype if you use it in other campaign settings or to model warlords other than the Purple Dragon Knights.":
		"Banneret sert de nom générique à cet archétype si vous l'utilisez dans d'autres cadres de campagne ou pour illustrer des chefs de guerre autres que les Chevaliers du Dragon Pourpre.",
	"A Purple Dragon Knight serves as an envoy of the Cormyrean crown. Knights of high standing are expected to conduct themselves with grace.":
		"Un Chevalier du Dragon Pourpre sert d'émissaire auprès de la couronne de Cormyr. On attend des chevaliers de haut rang qu'ils se conduisent avec élégance.",
	"At 7th level, you gain proficiency in the {@skill Persuasion} skill. If you are already proficient in it, you gain proficiency in one of the following skills of your choice: {@skill Dressage}, {@skill Perspicacité}, {@skill Intimidation}, or {@skill Représentation}.":
		"Au niveau 7, vous gagnez la maîtrise de la compétence {@skill Persuasion}. Si vous la maîtrisez déjà, vous gagnez la maîtrise de l'une des compétences suivantes, selon votre choix : {@skill Dressage}, {@skill Perspicacité}, {@skill Intimidation} ou {@skill Représentation}.",
	"Your proficiency bonus is doubled for any ability check you make that uses {@skill Persuasion}. You receive this benefit regardless of the skill proficiency you gain from this feature.":
		"Votre bonus de maîtrise est doublé pour tout test de caractéristique que vous effectuez et qui utilise {@skill Persuasion}. Vous bénéficiez de cet avantage quelle que soit la maîtrise de compétence que vous gagnez grâce à cette capacité.",
	"Starting at 10th level, when you use your Action Surge feature, you can choose one creature within 60 feet of you that is allied with you. That creature can make one melee or ranged weapon attack with its reaction, provided that it can see or hear you.":
		"À partir du niveau 10, lorsque vous utilisez votre capacité Explosion d'action, vous pouvez choisir une créature alliée dans un rayon de 18 mètres autour de vous. Cette créature peut effectuer une attaque d'arme au corps à corps ou à distance avec sa réaction, à condition qu'elle puisse vous voir ou vous entendre.",
	"Starting at 18th level, you can choose two allies within 60 feet of you, rather than one.":
		"À partir du niveau 18, vous pouvez choisir deux alliés dans un rayon de 18 mètres autour de vous, au lieu d'un seul.",
	"Beginning at 15th level, you can extend the benefit of your Indomitable feature to an ally. When you decide to use Indomitable to reroll an Intelligence, a Wisdom, or a Charisma saving throw and you aren't {@condition Incapable}, you can choose one ally within 60 feet of you that also failed its saving throw against the same effect. If that creature can see or hear you, it can reroll its saving throw and must use the new roll.":
		"À partir du niveau 15, vous pouvez étendre le bénéfice de votre capacité Indomptable à un allié. Quand vous décidez d'utiliser Indomptable pour relancer un jet de sauvegarde d'Intelligence, de Sagesse ou de Charisme et que vous n'êtes pas {@condition Incapable}, vous pouvez choisir un allié dans un rayon de 18 mètres autour de vous qui a lui aussi raté son jet de sauvegarde contre le même effet. Si cette créature peut vous voir ou vous entendre, elle peut relancer son jet de sauvegarde et doit utiliser le nouveau résultat.",

	// Psi Warrior (TCE)
	"When you or another creature you can see within 30 feet of you takes damage, you can use your reaction to expend one Psionic Energy die, roll the die, and reduce the damage taken by the number rolled plus your Intelligence modifier (minimum reduction of 1), as you create a momentary shield of telekinetic force.":
		"Quand vous ou une autre créature que vous pouvez voir à 9 mètres de vous ou moins subissez des dégâts, vous pouvez utiliser votre réaction pour dépenser un dé d'énergie psionique, lancer ce dé et réduire les dégâts subis du résultat obtenu plus votre modificateur d'Intelligence (réduction minimale de 1), tandis que vous créez un bref bouclier de force télékinétique.",
	"Awake to the psionic power within, a Psi Warrior is a fighter who augments their physical might with psi-infused weapon strikes, telekinetic lashes, and barriers of mental force. Many githyanki train to become such warriors, as do some of the most disciplined high elves. In the world of Eberron, many young kalashtar dream of becoming Psi Warriors.":
		"Éveillé au pouvoir psionique qui sommeille en lui, le Guerrier psionique est un guerrier qui augmente sa puissance physique de frappes d'armes imprégnées de psi, de coups de fouet télékinétiques et de barrières de force mentale. Beaucoup de githyanki s'entraînent pour devenir de tels guerriers, de même que certains des hauts elfes les plus disciplinés. Dans le monde d'Eberron, de nombreux jeunes kalashtar rêvent de devenir des Guerriers psioniques.",
	"As a Psi Warrior, you might have honed your psionic abilities through solo discipline, unlocked it under the tutelage of a master, or refined it at an academy dedicated to wielding the mind's power as both weapon and shield.":
		"En tant que Guerrier psionique, vous avez pu aiguiser vos capacités psioniques par une discipline solitaire, les débloquer sous la tutelle d'un maître ou les affiner dans une académie dédiée à l'usage du pouvoir de l'esprit comme arme et bouclier.",
	"You can propel your weapons with psionic force. Once on each of your turns, immediately after you hit a target within 30 feet of you with an attack and deal damage to it with a weapon, you can expend one Psionic Energy die, rolling it and dealing force damage to the target equal to the number rolled plus your Intelligence modifier.":
		"Vous pouvez propulser vos armes avec la force psionique. Une fois à chacun de vos tours, immédiatement après avoir touché une cible à 9 mètres de vous ou moins avec une attaque et lui avoir infligé des dégâts avec une arme, vous pouvez dépenser un dé d'énergie psionique, le lancer et infliger des dégâts de force à la cible égaux au résultat obtenu plus votre modificateur d'Intelligence.",
	"You can move an object or a creature with your mind. As an action, you target one loose object that is Large or smaller or one willing creature, other than yourself. If you can see the target and it is within 30 feet of you, you can move it up to 30 feet to an unoccupied space you can see. Alternatively, if it is a Tiny object, you can move it to or from your hand. Either way, you can move the target horizontally, vertically, or both. Once you take this action, you can't do so again until you finish a short or long rest, unless you expend a Psionic Energy die to take it again.":
		"Vous pouvez déplacer un objet ou une créature par la pensée. À titre d'action, vous ciblez un objet libre de taille G ou inférieure ou une créature consentante autre que vous-même. Si vous pouvez voir la cible et qu'elle se trouve à 9 mètres de vous ou moins, vous pouvez la déplacer sur 9 mètres au maximum vers un espace inoccupé que vous pouvez voir. Sinon, s'il s'agit d'un objet de taille TP, vous pouvez le déplacer vers ou depuis votre main. Dans tous les cas, vous pouvez déplacer la cible horizontalement, verticalement ou les deux. Une fois cette action effectuée, vous ne pouvez plus la refaire avant d'avoir terminé un repos court ou long, sauf si vous dépensez un dé d'énergie psionique pour l'effectuer à nouveau.",
	"{@i 3rd-level Psi Warrior feature}": "{@i Capacité de Guerrier psionique de niveau 3}",
	"You harbor a wellspring of psionic energy within yourself. This energy is represented by your Psionic Energy dice, which are each a {@dice d6}. You have a number of these dice equal to twice your proficiency bonus, and they fuel various psionic powers you have, which are detailed below.":
		"Vous abritez en vous un puits d'énergie psionique. Cette énergie est représentée par vos dés d'énergie psionique, qui sont chacun un {@dice d6}. Vous possédez un nombre de ces dés égal au double de votre bonus de maîtrise, et ils alimentent les divers pouvoirs psioniques que vous possédez, détaillés ci-dessous.",
	"Some of your powers expend the Psionic Energy die they use, as specified in a power's description, and you can't use a power if it requires you to use a die when your dice are all expended. You regain all your expended Psionic Energy dice when you finish a long rest. In addition, as a bonus action, you can regain one expended Psionic Energy die, but you can't do so again until you finish a short or long rest.":
		"Certains de vos pouvoirs dépensent le dé d'énergie psionique qu'ils utilisent, comme précisé dans la description du pouvoir, et vous ne pouvez pas utiliser un pouvoir nécessitant un dé si tous vos dés sont dépensés. Vous récupérez tous vos dés d'énergie psionique dépensés lorsque vous terminez un repos long. En outre, à titre d'action bonus, vous pouvez récupérer un dé d'énergie psionique dépensé, mais vous ne pouvez plus le faire avant d'avoir terminé un repos court ou long.",
	"When you reach certain levels in this class, the size of your Psionic Energy dice increases: at 5th level ({@dice d8}), 11th level ({@dice d10}), and 17th level ({@dice d12}).":
		"Lorsque vous atteignez certains niveaux dans cette classe, la taille de vos dés d'énergie psionique augmente : au niveau 5 ({@dice d8}), au niveau 11 ({@dice d10}) et au niveau 17 ({@dice d12}).",
	"The powers below use your Psionic Energy dice.":
		"Les pouvoirs ci-dessous utilisent vos dés d'énergie psionique.",
	"As a bonus action, you can propel your body with your mind. You gain a flying speed equal to twice your walking speed until the end of the current turn. Once you take this bonus action, you can't do so again until you finish a short or long rest, unless you expend a Psionic Energy die to take it again.":
		"À titre d'action bonus, vous pouvez propulser votre corps par la pensée. Vous obtenez une vitesse de vol égale au double de votre vitesse de déplacement jusqu'à la fin du tour en cours. Une fois cette action bonus utilisée, vous ne pouvez plus la refaire avant d'avoir terminé un repos court ou long, sauf si vous dépensez un dé d'énergie psionique pour l'utiliser à nouveau.",
	"When you deal damage to a target with your Psionic Strike, you can force the target to make a Strength saving throw against a DC equal to 8 + your proficiency bonus + your Intelligence modifier. If the save fails, you can knock the target {@condition À terre} or move it up to 10 feet in any direction horizontally.":
		"Quand vous infligez des dégâts à une cible avec votre Frappe psionique, vous pouvez obliger la cible à faire un jet de sauvegarde de Force contre un DD égal à 8 + votre bonus de maîtrise + votre modificateur d'Intelligence. En cas d'échec, vous pouvez faire tomber la cible {@condition À terre} ou la déplacer sur 3 mètres au maximum dans n'importe quelle direction horizontale.",
	"{@i 7th-level Psi Warrior feature}": "{@i Capacité de Guerrier psionique de niveau 7}",
	"You have mastered new ways to use your telekinetic abilities, detailed below.":
		"Vous avez maîtrisé de nouvelles façons d'utiliser vos capacités télékinétiques, détaillées ci-dessous.",
	"{@i 10th-level Psi Warrior feature}": "{@i Capacité de Guerrier psionique de niveau 10}",
	"The psionic energy flowing through you has bolstered your mind. You have resistance to psychic damage. Moreover, if you start your turn {@condition Charmé} or {@condition Effrayé}, you can expend a Psionic Energy die and end every effect on yourself subjecting you to those conditions.":
		"L'énergie psionique qui vous traverse a renforcé votre esprit. Vous avez la résistance aux dégâts psychiques. De plus, si vous commencez votre tour {@condition Charmé} ou {@condition Effrayé}, vous pouvez dépenser un dé d'énergie psionique et mettre fin à chaque effet sur vous qui vous soumet à ces états.",
	"{@i 15th-level Psi Warrior feature}": "{@i Capacité de Guerrier psionique de niveau 15}",
	"You can shield yourself and others with telekinetic force. As a bonus action, you can choose creatures, which can include you, that you can see within 30 feet of you, up to a number of creatures equal to your Intelligence modifier (minimum of one creature). Each of the chosen creatures is protected by {@quickref Cover||3||half cover} for 1 minute or until you're {@condition Incapable}.":
		"Vous pouvez vous protéger, vous et les autres, avec la force télékinétique. À titre d'action bonus, vous pouvez choisir des créatures que vous pouvez voir à 9 mètres de vous ou moins, vous y compris, jusqu'à un nombre de créatures égal à votre modificateur d'Intelligence (minimum une créature). Chacune des créatures choisies est protégée par une {@quickref Cover||3||demi-couverture} pendant 1 minute ou jusqu'à ce que vous soyez {@condition Incapable}.",
	"Once you take this bonus action, you can't do so again until you finish a long rest, unless you expend a Psionic Energy die to take it again.":
		"Une fois cette action bonus utilisée, vous ne pouvez plus la refaire avant d'avoir terminé un repos long, sauf si vous dépensez un dé d'énergie psionique pour l'utiliser à nouveau.",
	"{@i 18th-level Psi Warrior feature}": "{@i Capacité de Guerrier psionique de niveau 18}",
	"Your ability to move creatures and objects with your mind is matched by few. You can cast the {@spell telekinesis} spell, requiring no components, and your spellcasting ability for the spell is Intelligence. On each of your turns while you concentrate on the spell, including the turn when you cast it, you can make one attack with a weapon as a bonus action.":
		"Votre capacité à déplacer des créatures et des objets par la pensée n'a que peu d'égales. Vous pouvez lancer le sort {@spell telekinesis} sans composantes, et votre caractéristique de lancement de sorts pour ce sort est l'Intelligence. À chacun de vos tours pendant que vous vous concentrez sur le sort, y compris le tour où vous le lancez, vous pouvez effectuer une attaque avec une arme à titre d'action bonus.",
	"Once you cast the spell with this feature, you can't do so again until you finish a long rest, unless you expend a Psionic Energy die to cast it again.":
		"Une fois que vous avez lancé le sort grâce à cette capacité, vous ne pouvez plus le faire avant d'avoir terminé un repos long, sauf si vous dépensez un dé d'énergie psionique pour le lancer à nouveau.",

	// Rune Knight (TCE)
	"Rune Knights enhance their martial prowess using the supernatural power of runes, an ancient practice that originated with giants. Rune cutters can be found among any family of giants, and you likely learned your methods first or second hand from such a mystical artisan. Whether you found the giant's work carved into a hill or cave, learned of the runes from a sage, or met the giant in person, you studied the giant's craft and learned how to apply magic runes to empower your equipment.":
		"Les Chevaliers des runes augmentent leur prouesse martiale grâce au pouvoir surnaturel des runes, une pratique ancestrale originaire des géants. On trouve des sculpteurs de runes dans toutes les familles de géants, et vous avez probablement appris vos méthodes, de première ou deuxième main, auprès d'un tel artisan mystique. Que vous ayez découvert l'œuvre d'un géant gravée dans une colline ou une grotte, appris l'existence des runes auprès d'un sage, ou rencontré le géant en personne, vous avez étudié l'artisanat du géant et appris comment appliquer des runes magiques pour augmenter la puissance de votre équipement.",
	"{@i 3rd-level Rune Knight feature}": "{@i Capacité de Chevalier des runes de niveau 3}",
	"You have learned how to imbue yourself with the might of giants. As a bonus action, you magically gain the following benefits, which last for 1 minute:":
		"Vous avez appris à vous imprégner de la puissance des géants. À titre d'action bonus, vous gagnez magiquement les avantages suivants, qui durent 1 minute :",
	"If you are smaller than Large, you become Large, along with anything you are wearing. If you lack the room to become Large, your size doesn't change.":
		"Si vous êtes d'une taille inférieure à G, vous devenez de taille G, ainsi que tout ce que vous portez. Si vous manquez de place pour devenir de taille G, votre taille ne change pas.",
	"You have advantage on Strength checks and Strength saving throws.":
		"Vous avez un avantage aux tests de Force et aux jets de sauvegarde de Force.",
	"Once on each of your turns, one of your attacks with a weapon or an unarmed strike can deal an extra {@damage 1d6} damage to a target on a hit.":
		"Une fois à chacun de vos tours, une de vos attaques avec une arme ou une frappe sans arme peut infliger {@damage 1d6} dégâts supplémentaires à une cible en cas de coup au but.",
	"You can use this feature a number of times equal to your proficiency bonus, and you regain all expended uses of it when you finish a long rest.":
		"Vous pouvez utiliser cette capacité un nombre de fois égal à votre bonus de maîtrise, et vous récupérez toutes les utilisations dépensées lorsque vous terminez un repos long.",
	"You can use magic runes to enhance your gear. You learn two runes of your choice, from among the runes described below, and each time you gain a level in this class, you can replace one rune you know with a different one from this feature. When you reach certain levels in this class, you learn additional runes, as shown in the Runes Known table.":
		"Vous pouvez utiliser des runes magiques pour améliorer votre équipement. Vous apprenez deux runes de votre choix, parmi les runes décrites ci-dessous, et chaque fois que vous gagnez un niveau dans cette classe, vous pouvez remplacer une rune que vous connaissez par une autre de cette capacité. Lorsque vous atteignez certains niveaux dans cette classe, vous apprenez des runes supplémentaires, comme l'indique la table Runes connues.",
	"Whenever you finish a long rest, you can touch a number of objects equal to the number of runes you know, and you inscribe a different rune onto each of the objects. To be eligible, an object must be a weapon, a suit of armor, a shield, a piece of jewelry, or something else you can wear or hold in a hand. Your rune remains on an object until you finish a long rest, and an object can bear only one of your runes at a time.":
		"Chaque fois que vous terminez un repos long, vous pouvez toucher un nombre d'objets égal au nombre de runes que vous connaissez, et vous inscrivez une rune différente sur chacun de ces objets. Pour être éligible, un objet doit être une arme, une armure, un bouclier, une pièce de bijouterie ou autre chose que vous pouvez porter ou tenir à la main. Votre rune demeure sur un objet jusqu'à ce que vous terminiez un repos long, et un objet ne peut porter qu'une seule de vos runes à la fois.",
	"Fighter Level": "Niveau de guerrier",
	"Number of Runes": "Nombre de runes",
	"The following runes are available to you when you learn a rune. If a rune has a level requirement, you must be at least that level in this class to learn the rune. If a rune requires a saving throw, your Rune Magic save DC equals 8 + your proficiency bonus + your Constitution modifier.":
		"Les runes suivantes s'offrent à vous quand vous apprenez une rune. Si une rune a un prérequis de niveau, vous devez être au moins à ce niveau dans cette classe pour l'apprendre. Si une rune nécessite un jet de sauvegarde, le DD de sauvegarde de votre Magie runique est égal à 8 + votre bonus de maîtrise + votre modificateur de Constitution.",
	"{@i 7th-level Rune Knight feature}": "{@i Capacité de Chevalier des runes de niveau 7}",
	"You learn an additional Rune.": "Vous apprenez une rune supplémentaire.",
	"You learn to invoke your rune magic to protect your allies. When another creature you can see within 60 feet of you is hit by an attack roll, you can use your reaction to force the attacker to reroll the {@dice d20} and use the new roll.":
		"Vous apprenez à invoquer votre magie runique pour protéger vos alliés. Quand une autre créature que vous pouvez voir à 18 mètres de vous ou moins est touchée par un jet d'attaque, vous pouvez utiliser votre réaction pour obliger l'attaquant à relancer le {@dice d20} et à utiliser le nouveau résultat.",
	"{@i 10th-level Rune Knight feature}": "{@i Capacité de Chevalier des runes de niveau 10}",
	"The magic of your runes permanently alters you. When you gain this feature, roll {@dice 3d4}. You grow a number of inches in height equal to the roll.":
		"La magie de vos runes vous modifie de façon permanente. Quand vous gagnez cette capacité, lancez un {@dice 3d4}. Vous grandissez d'un nombre de centimètres égal au résultat multiplié par 2,5.",
	"Moreover, the extra damage you deal with your Giant's Might feature increases to {@dice 1d8}.":
		"En outre, les dégâts supplémentaires que vous infligez avec votre capacité Puissance du géant augmentent à {@dice 1d8}.",
	"{@i 15th-level Rune Knight feature}": "{@i Capacité de Chevalier des runes de niveau 15}",
	"You can invoke each rune you know from your Rune Carver feature twice, rather than once, and you regain all expended uses when you finish a short or long rest.":
		"Vous pouvez invoquer deux fois, plutôt qu'une, chaque rune que vous connaissez grâce à votre capacité Sculpteur de runes, et vous récupérez toutes les utilisations dépensées lorsque vous terminez un repos court ou long.",
	"{@i 18th-level Rune Knight feature}": "{@i Capacité de Chevalier des runes de niveau 18}",
	"You learn how to amplify your rune-powered transformation. As a result, the extra damage you deal with the Giant's Might feature increases to {@dice 1d10}. Moreover, when you use that feature, your size can increase to Huge, and while you are that size, your reach increases by 5 feet.":
		"Vous apprenez à amplifier votre transformation dopée aux runes. Ainsi, les dégâts supplémentaires que vous infligez avec la capacité Puissance du géant augmentent à {@dice 1d10}. En outre, quand vous utilisez cette capacité, votre taille peut augmenter jusqu'à TT, et tant que vous êtes de cette taille, votre allonge augmente de 1,5 mètre.",

	// Arcane Archer (XGE)
	"An Arcane Archer studies a unique elven method of archery that weaves magic into attacks to produce supernatural effects. Arcane Archers are some of the most elite warriors among the elves. They stand watch over the fringes of elven domains, keeping a keen eye out for trespassers and using magic-infused arrows to defeat monsters and invaders before they can reach elven settlements. Over the centuries, the methods of these elf archers have been learned by members of other races who can also balance arcane aptitude with archery.":
		"L'Archer arcanique étudie une méthode elfique unique de tir à l'arc qui tisse la magie dans les attaques pour produire des effets surnaturels. Les Archers arcaniques comptent parmi les guerriers les plus élites des elfes. Ils montent la garde aux franges des domaines elfiques, guettant du regard les intrus et utilisant des flèches imprégnées de magie pour vaincre les monstres et les envahisseurs avant qu'ils n'atteignent les établissements elfiques. Au fil des siècles, les méthodes de ces archers elfes ont été apprises par des membres d'autres races capables, eux aussi, d'allier aptitude arcanique et tir à l'arc.",
	"At 3rd level, you learn magical theory or some of the secrets of nature\u2014typical for practitioners of this elven martial tradition. You choose to gain proficiency in either the {@skill Arcanes} or the {@skill Nature} skill, and you choose to learn either the {@spell prestidigitation} or the {@spell druidcraft} cantrip.":
		"Au niveau 3, vous apprenez la théorie magique ou quelques-uns des secrets de la nature, ce qui est typique des praticiens de cette tradition martiale elfique. Vous choisissez de gagner la maîtrise de la compétence {@skill Arcanes} ou {@skill Nature}, et vous choisissez d'apprendre le tour de magie {@spell prestidigitation} ou {@spell druidcraft}.",
	"At 3rd level, you learn to unleash special magical effects with some of your shots. When you gain this feature, you learn two Arcane Shot options of your choice (see \\\"Arcane Shot Options\\\" below).":
		"Au niveau 3, vous apprenez à libérer des effets magiques spéciaux avec certains de vos tirs. Quand vous gagnez cette capacité, vous apprenez deux options de Tir arcanique de votre choix (voir « Options de tir arcanique » ci-dessous).",
	"Once per turn when you fire an arrow from a shortbow or longbow as part of the {@action Attaque} action, you can apply one of your Arcane Shot options to that arrow. You decide to use the option when the arrow hits a creature, unless the option doesn't involve an attack roll. You have two uses of this ability, and you regain all expended uses of it when you finish a short or long rest.":
		"Une fois par tour, quand vous décochez une flèche depuis un arc court ou un arc long dans le cadre de l'action {@action Attaque}, vous pouvez appliquer l'une de vos options de Tir arcanique à cette flèche. Vous décidez d'utiliser l'option quand la flèche touche une créature, sauf si l'option n'implique pas de jet d'attaque. Vous disposez de deux utilisations de cette capacité, et vous récupérez toutes les utilisations dépensées lorsque vous terminez un repos court ou long.",
	"You gain an additional Arcane Shot option of your choice when you reach certain levels in this class: 7th, 10th, 15th, and 18th level. Each option also improves when you become an 18th-level fighter.":
		"Vous gagnez une option de Tir arcanique supplémentaire de votre choix quand vous atteignez certains niveaux dans cette classe : 7, 10, 15 et 18. Chaque option s'améliore également quand vous devenez un guerrier de niveau 18.",
	"The Arcane Shot feature lets you choose options for it at certain levels. The options are presented here in alphabetical order. They are all magical effects, and each one is associated with one of the schools of magic.":
		"La capacité Tir arcanique vous permet de choisir certaines options à des niveaux donnés. Les options sont présentées ici par ordre alphabétique. Ce sont tous des effets magiques, et chacun est associé à l'une des écoles de magie.",
	"If an option requires a saving throw, your Arcane Shot save DC is calculated as follows:":
		"Si une option nécessite un jet de sauvegarde, le DD de sauvegarde de votre Tir arcanique est calculé comme suit :",
	"You gain an additional Arcane Shot option of your choice when you reach 7th level.":
		"Vous gagnez une option de Tir arcanique supplémentaire de votre choix quand vous atteignez le niveau 7.",
	"At 7th level, you learn how to direct an errant arrow toward a new target. When you make an attack roll with a magic arrow and miss, you can use a bonus action to reroll the attack roll against a different target within 60 feet of the original target.":
		"Au niveau 7, vous apprenez à rediriger une flèche égarée vers une nouvelle cible. Quand vous effectuez un jet d'attaque avec une flèche magique et le manquez, vous pouvez utiliser une action bonus pour relancer le jet d'attaque contre une cible différente à 18 mètres ou moins de la cible d'origine.",
	"At 7th level, you gain the ability to infuse arrows with magic. Whenever you fire a nonmagical arrow from a shortbow or longbow, you can make it magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage. The magic fades from the arrow immediately after it hits or misses its target.":
		"Au niveau 7, vous gagnez la capacité d'imprégner les flèches de magie. Chaque fois que vous décochez une flèche non magique depuis un arc court ou un arc long, vous pouvez la rendre magique dans le but de surmonter la résistance et l'immunité aux attaques et dégâts non magiques. La magie disparaît de la flèche immédiatement après qu'elle a touché ou manqué sa cible.",
	"You gain an additional Arcane Shot option of your choice when you reach 10th level.":
		"Vous gagnez une option de Tir arcanique supplémentaire de votre choix quand vous atteignez le niveau 10.",
	"You gain an additional Arcane Shot option of your choice when you reach 15th level.":
		"Vous gagnez une option de Tir arcanique supplémentaire de votre choix quand vous atteignez le niveau 15.",
	"Starting at 15th level, your magical archery is available whenever battle starts. If you roll initiative and have no uses of Arcane Shot remaining, you regain one use of it.":
		"À partir du niveau 15, votre tir magique est disponible dès que le combat commence. Si vous faites un jet d'initiative et qu'il ne vous reste aucune utilisation de Tir arcanique, vous en récupérez une.",
	"You gain an additional Arcane Shot option of your choice when you reach 18th level. Each option also improves when you become an 18th-level fighter.":
		"Vous gagnez une option de Tir arcanique supplémentaire de votre choix quand vous atteignez le niveau 18. Chaque option s'améliore également quand vous devenez un guerrier de niveau 18.",

	// Cavalier (XGE)
	"The archetypal Cavalier excels at mounted combat. Usually born among the nobility and raised at court, a Cavalier is equally at home leading a cavalry charge or exchanging repartee at a state dinner. Cavaliers also learn how to guard those in their charge from harm, often serving as the protectors of their superiors and of the weak. Compelled to right wrongs or earn prestige, many of these fighters leave their lives of comfort to embark on glorious adventure.":
		"Le Cavalier, dans sa forme archétypale, excelle dans le combat monté. Généralement issu de la noblesse et élevé à la cour, un Cavalier est aussi à l'aise à la tête d'une charge de cavalerie qu'à échanger des reparties lors d'un dîner d'État. Les Cavaliers apprennent également à protéger du mal ceux qui leur sont confiés, servant souvent de protecteurs à leurs supérieurs et aux faibles. Poussés à réparer les torts ou à gagner du prestige, beaucoup de ces guerriers quittent leur vie de confort pour se lancer dans de glorieuses aventures.",
	"When you choose this archetype at 3rd level, you gain proficiency in one of the following skills of your choice: {@skill Dressage}, {@skill Histoire}, {@skill Perspicacité}, {@skill Représentation}, or {@skill Persuasion}. Alternatively, you learn one language of your choice.":
		"Lorsque vous choisissez cet archétype au niveau 3, vous gagnez la maîtrise de l'une des compétences suivantes, selon votre choix : {@skill Dressage}, {@skill Histoire}, {@skill Perspicacité}, {@skill Représentation} ou {@skill Persuasion}. Alternativement, vous apprenez une langue de votre choix.",
	"Starting at 3rd level, your mastery as a rider becomes apparent. You have advantage on saving throws made to avoid falling off your mount. If you fall off your mount and descend no more than 10 feet, you can land on your feet if you're not {@condition Incapable}.":
		"À partir du niveau 3, votre maîtrise de cavalier devient évidente. Vous avez un avantage aux jets de sauvegarde effectués pour éviter de tomber de votre monture. Si vous tombez de votre monture et chutez de 3 mètres au plus, vous pouvez atterrir sur vos pieds si vous n'êtes pas {@condition Incapable}.",
	"Finally, mounting or dismounting a creature costs you only 5 feet of movement, rather than half your speed.":
		"Enfin, monter ou descendre d'une créature ne vous coûte que 1,5 mètre de déplacement, au lieu de la moitié de votre vitesse.",
	"Starting at 3rd level, you can menace your foes, foiling their attacks and punishing them for harming others. When you hit a creature with a melee weapon attack, you can mark the creature until the end of your next turn. This effect ends early if you are {@condition Incapable} or you die, or if someone else marks the creature.":
		"À partir du niveau 3, vous pouvez menacer vos ennemis, contrecarrer leurs attaques et les punir d'avoir nui à autrui. Quand vous touchez une créature avec une attaque d'arme au corps à corps, vous pouvez marquer la créature jusqu'à la fin de votre prochain tour. Cet effet prend fin prématurément si vous êtes {@condition Incapable} ou si vous mourez, ou si quelqu'un d'autre marque la créature.",
	"While it is within 5 feet of you, a creature marked by you has disadvantage on any attack roll that doesn't target you.":
		"Tant qu'elle se trouve à 1,5 mètre de vous ou moins, une créature marquée par vous a un désavantage à tout jet d'attaque qui ne vous cible pas.",
	"In addition, if a creature marked by you deals damage to anyone other than you, you can make a special melee weapon attack against the marked creature as a bonus action on your next turn. You have advantage on the attack roll, and if it hits, the attack's weapon deals extra damage to the target equal to half your fighter level.":
		"En outre, si une créature marquée par vous inflige des dégâts à quiconque autre que vous, vous pouvez effectuer une attaque d'arme au corps à corps spéciale contre la créature marquée à titre d'action bonus pendant votre prochain tour. Vous avez un avantage au jet d'attaque, et en cas de coup au but, l'arme de l'attaque inflige des dégâts supplémentaires à la cible égaux à la moitié de votre niveau de guerrier.",
	"Regardless of the number of creatures you mark, you can make this special attack a number of times equal to your Strength modifier (minimum of once), and you regain all expended uses of it when you finish a long rest.":
		"Quel que soit le nombre de créatures que vous marquez, vous pouvez effectuer cette attaque spéciale un nombre de fois égal à votre modificateur de Force (minimum une fois), et vous récupérez toutes les utilisations dépensées lorsque vous terminez un repos long.",
	"At 7th level, you learn to fend off strikes directed at you, your mount, or other creatures nearby. If you or a creature you can see within 5 feet of you is hit by an attack, you can roll {@dice 1d8} as a reaction if you're wielding a melee weapon or a shield. Roll the die, and add the number rolled to the target's AC against that attack. If the attack still hits, the target has resistance against the attack's damage.":
		"Au niveau 7, vous apprenez à parer les frappes dirigées contre vous, votre monture ou d'autres créatures proches. Si vous ou une créature que vous pouvez voir à 1,5 mètre de vous ou moins êtes touché par une attaque, vous pouvez lancer un {@dice 1d8} à titre de réaction si vous maniez une arme au corps à corps ou un bouclier. Lancez le dé et ajoutez le résultat à la CA de la cible contre cette attaque. Si l'attaque touche tout de même, la cible a la résistance aux dégâts de l'attaque.",
	"You can use this feature a number of times equal to your Constitution modifier (minimum of once), and you regain all expended uses of it when you finish a long rest.":
		"Vous pouvez utiliser cette capacité un nombre de fois égal à votre modificateur de Constitution (minimum une fois), et vous récupérez toutes les utilisations dépensées lorsque vous terminez un repos long.",
	"At 10th level, you become a master of locking down your enemies. Creatures provoke an opportunity attack from you when they move 5 feet or more while within your reach, and if you hit a creature with an opportunity attack, the target's speed is reduced to 0 until the end of the current turn.":
		"Au niveau 10, vous devenez un maître pour immobiliser vos ennemis. Les créatures provoquent une attaque d'opportunité de votre part quand elles se déplacent de 1,5 mètre ou plus tout en se trouvant dans votre allonge, et si vous touchez une créature avec une attaque d'opportunité, la vitesse de la cible est réduite à 0 jusqu'à la fin du tour en cours.",
	"Starting at 15th level, you can run down your foes, whether you're mounted or not. If you move at least 10 feet in a straight line right before attacking a creature and you hit it with the attack, that target must succeed on a Strength saving throw ({@dc 8} + your proficiency bonus + your Strength modifier) or be knocked {@condition À terre}. You can use this feature only once on each of your turns.":
		"À partir du niveau 15, vous pouvez foncer sur vos ennemis, que vous soyez monté ou non. Si vous vous déplacez d'au moins 3 mètres en ligne droite juste avant d'attaquer une créature et que vous la touchez avec l'attaque, la cible doit réussir un jet de sauvegarde de Force ({@dc 8} + votre bonus de maîtrise + votre modificateur de Force) ou être renversée {@condition À terre}. Vous ne pouvez utiliser cette capacité qu'une seule fois à chacun de vos tours.",
	"Starting at 18th level, you respond to danger with extraordinary vigilance. In combat, you get a special reaction that you can take once on every creature's turn, except your turn. You can use this special reaction only to make an opportunity attack, and you can't use it on the same turn that you take your normal reaction.":
		"À partir du niveau 18, vous répondez au danger avec une vigilance extraordinaire. Au combat, vous disposez d'une réaction spéciale que vous pouvez utiliser une fois à chaque tour de créature, sauf le vôtre. Vous ne pouvez utiliser cette réaction spéciale que pour effectuer une attaque d'opportunité, et vous ne pouvez pas l'utiliser au même tour que votre réaction normale.",

	// Samurai (XGE)
	"The Samurai is a fighter who draws on an implacable fighting spirit to overcome enemies. A Samurai's resolve is nearly unbreakable, and the enemies in a Samurai's path have two choices: yield or die fighting.":
		"Le Samouraï est un guerrier qui puise dans un esprit combatif implacable pour vaincre ses ennemis. La résolution d'un Samouraï est presque inébranlable, et les ennemis sur son chemin n'ont que deux choix : céder ou mourir les armes à la main.",
	"When you choose this archetype at 3rd level, you gain proficiency in one of the following skills of your choice: {@skill Histoire}, {@skill Perspicacité}, {@skill Représentation}, or {@skill Persuasion}. Alternatively, you learn one language of your choice.":
		"Lorsque vous choisissez cet archétype au niveau 3, vous gagnez la maîtrise de l'une des compétences suivantes, selon votre choix : {@skill Histoire}, {@skill Perspicacité}, {@skill Représentation} ou {@skill Persuasion}. Alternativement, vous apprenez une langue de votre choix.",
	"Starting at 3rd level, your intensity in battle can shield you and help you strike true. As a bonus action on your turn, you can give yourself advantage on weapon attack rolls until the end of the current turn. When you do so, you also gain 5 temporary hit points. The number of temporary hit points increases when you reach certain levels in this class, increasing to 10 at 10th level and 15 at 15th level.":
		"À partir du niveau 3, votre intensité au combat peut vous protéger et vous aider à frapper juste. À titre d'action bonus pendant votre tour, vous pouvez vous accorder un avantage aux jets d'attaque avec une arme jusqu'à la fin du tour en cours. Ce faisant, vous gagnez également 5 points de vie temporaires. Ce nombre de points de vie temporaires augmente quand vous atteignez certains niveaux dans cette classe : 10 au niveau 10 et 15 au niveau 15.",
	"You can use this feature three times, and you regain all expended uses of it when you finish a long rest.":
		"Vous pouvez utiliser cette capacité trois fois, et vous récupérez toutes les utilisations dépensées lorsque vous terminez un repos long.",
	"Starting at 7th level, your discipline and attention to detail allow you to excel in social situations. Whenever you make a Charisma ({@skill Persuasion}) check, you gain a bonus to the check equal to your Wisdom modifier.":
		"À partir du niveau 7, votre discipline et votre sens du détail vous permettent d'exceller dans les situations sociales. Chaque fois que vous faites un test de Charisme ({@skill Persuasion}), vous gagnez un bonus au test égal à votre modificateur de Sagesse.",
	"Your self-control also causes you to gain proficiency in Wisdom saving throws. If you already have this proficiency, you instead gain proficiency in Intelligence or Charisma saving throws (your choice).":
		"Votre maîtrise de vous-même vous confère également la maîtrise des jets de sauvegarde de Sagesse. Si vous possédez déjà cette maîtrise, vous gagnez à la place la maîtrise des jets de sauvegarde d'Intelligence ou de Charisme (à votre choix).",
	"Starting at 10th level, when you roll initiative and have no uses of Fighting Spirit remaining, you regain one use.":
		"À partir du niveau 10, quand vous faites un jet d'initiative et qu'il ne vous reste aucune utilisation d'Esprit combatif, vous en récupérez une.",
	"Starting at 15th level, you learn to trade accuracy for swift strikes. If you take the {@action Attaque} action on your turn and have advantage on an attack roll against one of the targets, you can forgo the advantage for that roll to make an additional weapon attack against that target, as part of the same action. You can do so no more than once per turn.":
		"À partir du niveau 15, vous apprenez à échanger la précision contre la rapidité des frappes. Si vous utilisez l'action {@action Attaque} pendant votre tour et que vous avez un avantage à un jet d'attaque contre l'une des cibles, vous pouvez renoncer à l'avantage pour ce jet afin d'effectuer une attaque d'arme supplémentaire contre cette cible, dans le cadre de la même action. Vous ne pouvez le faire qu'une seule fois par tour.",
	"Starting at 18th level, your fighting spirit can delay the grasp of death. If you take damage that reduces you to 0 hit points and doesn't kill you outright, you can use your reaction to delay falling {@condition Inconscient}, and you can immediately take an extra turn, interrupting the current turn. While you have 0 hit points during that extra turn, taking damage causes death saving throw failures as normal, and three death saving throw failures can still kill you. When the extra turn ends, you fall {@condition Inconscient} if you still have 0 hit points.":
		"À partir du niveau 18, votre esprit combatif peut retarder l'étreinte de la mort. Si vous subissez des dégâts qui vous réduisent à 0 point de vie sans vous tuer sur le coup, vous pouvez utiliser votre réaction pour retarder le fait de tomber {@condition Inconscient}, et vous pouvez immédiatement entamer un tour supplémentaire, interrompant le tour en cours. Tant que vous avez 0 point de vie pendant ce tour supplémentaire, subir des dégâts entraîne des échecs aux jets de sauvegarde mortelle comme d'habitude, et trois échecs aux jets de sauvegarde mortelle peuvent toujours vous tuer. Quand le tour supplémentaire se termine, vous tombez {@condition Inconscient} si vous avez toujours 0 point de vie.",

	// Banneret (FRHoF)
	"{@i Rally Fellow Heroes with Inspiring Leadership}":
		"{@i Rassemblez les héros alliés grâce à un leadership inspirant}",
	"Bannerets are paragons of valor and leadership who protect the innocent and rally fellow adventurers to the causes of justice and freedom. Many are knights serving in Cormyr, the Silver Marches, Damara, Chessenta, or other lands across Faerûn. They wander the realms as knights errant, taking the fight against evil beyond their kingdom's borders.":
		"Les Bannerets sont des parangons de vaillance et de leadership qui protègent les innocents et rassemblent les aventuriers autour des causes de la justice et de la liberté. Beaucoup sont des chevaliers servant à Cormyr, dans les Marches d'Argent, en Damara, à Chessenta ou dans d'autres contrées de Faerûn. Ils parcourent les royaumes en chevaliers errants, menant le combat contre le mal au-delà des frontières de leur royaume.",
	"A Banneret relies on judgment, bravery, and fidelity to the code of chivalry to guide them in defeating evildoers. A lone Banneret is a skilled warrior, but when leading a band of allies one of these warriors can transform even a poorly equipped militia into a ferocious war band.":
		"Un Banneret compte sur son jugement, son courage et sa loyauté envers le code de la chevalerie pour le guider dans la défaite des malfaisants. Un Banneret solitaire est un guerrier compétent, mais à la tête d'un groupe d'alliés, l'un de ces guerriers peut transformer même une milice mal équipée en une bande de guerre féroce.",
	"When you use your Second Wind to regain {@variantrule Hit Points|XPHB}, you can choose a number of allies within a 30-foot {@variantrule Emanation [Area of Effect]|XPHB|Emanation} originating from yourself, up to a number of allies equal to your Charisma modifier (minimum of one). Each of those allies regains {@variantrule Hit Points|XPHB} equal to {@dice 1d4} plus your Fighter level. Once you use this ability, you can't use it again until you finish a {@variantrule Short Rest|XPHB|Short} or {@variantrule Long Rest|XPHB}.":
		"Quand vous utilisez votre Second souffle pour récupérer des {@variantrule Points de vie|XPHB|points de vie}, vous pouvez choisir un nombre d'alliés dans une {@variantrule Emanation [Area of Effect]|XPHB|Émanation} de 9 mètres émanant de vous, jusqu'à un nombre d'alliés égal à votre modificateur de Charisme (minimum un). Chacun de ces alliés récupère des {@variantrule Points de vie|XPHB|points de vie} égaux à {@dice 1d4} plus votre niveau de Guerrier. Une fois cette capacité utilisée, vous ne pouvez plus l'utiliser avant d'avoir terminé un {@variantrule Repos court|XPHB|repos court} ou un {@variantrule Repos long|XPHB|repos long}.",
	"You know how to conduct yourself with grace as a noble ambassador. You gain the following benefits.":
		"Vous savez vous conduire avec élégance en ambassadeur noble. Vous gagnez les avantages suivants.",
	"You can cast the {@spell Comprehend Languages|XPHB} spell but only as a {@variantrule Ritual|XPHB}. Charisma is your spellcasting ability for it.":
		"Vous pouvez lancer le sort {@spell Comprehend Languages|XPHB}, mais uniquement sous forme de {@variantrule Rituel|XPHB|rituel}. Le Charisme est votre caractéristique de lancement de sorts pour ce sort.",
	"You learn one language from the language tables in the Player's Handbook or chapter 2 of this book. When you finish a {@variantrule Long Rest|XPHB}, you can replace a language learned from this benefit with another language you have heard, seen signed, or read in the past 24 hours.":
		"Vous apprenez une langue parmi les tables de langues du Manuel des joueurs ou du chapitre 2 de ce livre. Quand vous terminez un {@variantrule Repos long|XPHB|repos long}, vous pouvez remplacer une langue apprise grâce à cet avantage par une autre langue que vous avez entendue, vue en signes ou lue au cours des dernières 24 heures.",
	"You gain proficiency in one of the following skills of your choice: {@skill Perspicacité|XPHB}, {@skill Intimidation|XPHB}, {@skill Persuasion|XPHB}, or {@skill Représentation|XPHB}.":
		"Vous gagnez la maîtrise de l'une des compétences suivantes, selon votre choix : {@skill Perspicacité|XPHB}, {@skill Intimidation|XPHB}, {@skill Persuasion|XPHB} ou {@skill Représentation|XPHB}.",
	"When you use Group Recovery, each chosen ally has {@variantrule Advantage|XPHB} on {@variantrule D20 Test|XPHB|D20 Tests} until the start of your next turn.":
		"Quand vous utilisez la Récupération de groupe, chaque allié choisi a un {@variantrule Advantage|XPHB|avantage} aux {@variantrule D20 Test|XPHB|tests de d20} jusqu'au début de votre prochain tour.",
	"When you use your Action Surge, you can choose allies within a 30-foot {@variantrule Emanation [Area of Effect]|XPHB|Emanation} originating from yourself, up to a number of allies equal to your Charisma modifier (minimum of one). Each of those allies can immediately take a {@variantrule Reaction|XPHB} to use one of the following options.":
		"Quand vous utilisez votre Explosion d'action, vous pouvez choisir des alliés dans une {@variantrule Emanation [Area of Effect]|XPHB|Émanation} de 9 mètres émanant de vous, jusqu'à un nombre d'alliés égal à votre modificateur de Charisme (minimum un). Chacun de ces alliés peut immédiatement utiliser une {@variantrule Réaction|XPHB|réaction} pour choisir l'une des options suivantes.",
	"The ally makes one attack with a weapon or an {@variantrule Unarmed Strike|XPHB}.":
		"L'allié effectue une attaque avec une arme ou une {@variantrule Unarmed Strike|XPHB|frappe sans arme}.",
	"The ally moves up to half its {@variantrule Speed|XPHB} without provoking an {@action Attaque d'opportunité|XPHB}.":
		"L'allié se déplace sur la moitié de sa {@variantrule Speed|XPHB|vitesse} au maximum sans provoquer d'{@action Attaque d'opportunité|XPHB|attaque d'opportunité}.",
	"When an ally you can see within 60 feet of yourself fails a saving throw, you can take a {@variantrule Reaction|XPHB} to expend a use of your Indomitable feature. The ally can immediately reroll the saving throw with a bonus equal to your Fighter level; the ally must use the new roll.":
		"Quand un allié que vous pouvez voir à 18 mètres de vous ou moins rate un jet de sauvegarde, vous pouvez utiliser une {@variantrule Réaction|XPHB|réaction} pour dépenser une utilisation de votre capacité Indomptable. L'allié peut immédiatement relancer le jet de sauvegarde avec un bonus égal à votre niveau de Guerrier ; l'allié doit utiliser le nouveau résultat.",
	"You gain the following benefits.": "Vous gagnez les avantages suivants.",
	"The area of effect for both Group Recovery and Rallying Surge is now a 60-foot {@variantrule Emanation [Area of Effect]|XPHB|Emanation}.":
		"La zone d'effet de la Récupération de groupe et de la Vague de ralliement est désormais une {@variantrule Emanation [Area of Effect]|XPHB|Émanation} de 18 mètres.",
	"You have {@variantrule Immunity|XPHB} to the {@condition Charmé|XPHB} and {@condition Effrayé|XPHB} conditions.":
		"Vous avez une {@variantrule Immunity|XPHB|immunité} aux états {@condition Charmé|XPHB} et {@condition Effrayé|XPHB}.",

	// Battle Master (XPHB)
	"{@i Master Sophisticated Battle Maneuvers}": "{@i Maîtrisez des manœuvres de combat sophistiquées}",
	"Battle Masters are students of the art of battle, learning martial techniques passed down through generations. The most accomplished Battle Masters are well-rounded figures who combine their carefully honed combat skills with academic study in the fields of history, theory, and the arts.":
		"Les Maîtres de guerre sont des étudiants de l'art du combat, qui apprennent des techniques martiales transmises de génération en génération. Les Maîtres de guerre les plus accomplis sont des figures complètes, alliant leurs compétences de combat soigneusement aiguisées à l'étude académique de l'histoire, de la théorie et des arts.",
	"Your experience on the battlefield has refined your fighting techniques. You learn maneuvers that are fueled by special dice called Superiority Dice.":
		"Votre expérience du champ de bataille a affiné vos techniques de combat. Vous apprenez des manœuvres alimentées par des dés spéciaux appelés Dés de supériorité.",
	"You learn three maneuvers of your choice from the \\\"{@filter Maneuvers Options|optionalfeatures|feature type=MV:B|source=XPHB}\\\" section later in this subclass's description. Many maneuvers enhance an attack in some way. You can use only one maneuver per attack.":
		"Vous apprenez trois manœuvres de votre choix dans la section « {@filter Maneuvers Options|optionalfeatures|feature type=MV:B|source=XPHB|Options de manœuvres} » plus loin dans la description de cette sous-classe. Nombreuses sont les manœuvres qui augmentent d'une façon ou d'une autre une attaque. Vous ne pouvez utiliser qu'une seule manœuvre par attaque.",
	"You learn two additional maneuvers of your choice when you reach Fighter levels 7, 10, and 15. Each time you learn new maneuvers, you can also replace one maneuver you know with a different one.":
		"Vous apprenez deux manœuvres supplémentaires de votre choix lorsque vous atteignez les niveaux de Guerrier 7, 10 et 15. Chaque fois que vous apprenez de nouvelles manœuvres, vous pouvez également remplacer une manœuvre que vous connaissez par une autre.",
	"You have four Superiority Dice, which are {@dice d8|d8s}. A Superiority Die is expended when you use it. You regain all expended Superiority Dice when you finish a {@variantrule Short Rest|XPHB|Short} or {@variantrule Long Rest|XPHB}.":
		"Vous possédez quatre Dés de supériorité, qui sont des {@dice d8|d8}. Un Dé de supériorité est dépensé quand vous l'utilisez. Vous récupérez tous les Dés de supériorité dépensés lorsque vous terminez un {@variantrule Repos court|XPHB|repos court} ou un {@variantrule Repos long|XPHB|repos long}.",
	"You gain an additional Superiority Die when you reach Fighter levels 7 (five dice total) and 15 (six dice total).":
		"Vous gagnez un Dé de supériorité supplémentaire lorsque vous atteignez les niveaux de Guerrier 7 (cinq dés au total) et 15 (six dés au total).",
	"If a maneuver requires a saving throw, the DC equals 8 plus your Strength or Dexterity modifier (your choice) and {@variantrule Proficiency|XPHB|Proficiency Bonus}.":
		"Si une manœuvre nécessite un jet de sauvegarde, le DD est égal à 8 plus votre modificateur de Force ou de Dextérité (à votre choix) et votre {@variantrule Proficiency|XPHB|bonus de maîtrise}.",
	"The maneuvers are presented here in alphabetical order.":
		"Les manœuvres sont présentées ici par ordre alphabétique.",
	"You gain proficiency with one type of {@item Artisan's Tools|XPHB} of your choice, and you gain proficiency in one skill of your choice from the skills available to Fighters at level 1.":
		"Vous gagnez la maîtrise d'un type d'{@item Outils d'artisan|XPHB} de votre choix, et vous gagnez la maîtrise d'une compétence de votre choix parmi les compétences accessibles aux Guerriers au niveau 1.",
	"As a {@variantrule Bonus Action|XPHB}, you can discern certain strengths and weaknesses of a creature you can see within 30 feet of yourself; you know whether that creature has any Immunities, Resistances, or Vulnerabilities, and if the creature has any, you know what they are.":
		"À titre d'{@variantrule Action bonus|XPHB|action bonus}, vous pouvez discerner certaines forces et faiblesses d'une créature que vous pouvez voir à 9 mètres de vous ou moins ; vous savez si cette créature possède des immunités, des résistances ou des vulnérabilités, et si elle en possède, vous savez lesquelles.",
	"Once you use this feature, you can't do so again until you finish a {@variantrule Long Rest|XPHB}. You can also restore a use of the feature by expending one Superiority Die (no action required).":
		"Une fois cette capacité utilisée, vous ne pouvez plus la refaire avant d'avoir terminé un {@variantrule Repos long|XPHB|repos long}. Vous pouvez également restaurer une utilisation de cette capacité en dépensant un Dé de supériorité (aucune action requise).",
	"Your Superiority Die becomes a {@dice d10}.": "Votre Dé de supériorité devient un {@dice d10}.",
	"Once per turn, when you use a maneuver, you can roll {@dice 1d8} and use the number rolled instead of expending a Superiority Die.":
		"Une fois par tour, quand vous utilisez une manœuvre, vous pouvez lancer un {@dice 1d8} et utiliser le résultat obtenu au lieu de dépenser un Dé de supériorité.",
	"Your Superiority Die becomes a {@dice d12}.": "Votre Dé de supériorité devient un {@dice d12}.",

	// Champion (XPHB)
	"{@i Pursue Physical Excellence in Combat}": "{@i Recherchez l'excellence physique au combat}",
	"A Champion focuses on the development of martial prowess in a relentless pursuit of victory. Champions combine rigorous training with physical excellence to deal devastating blows, withstand peril, and garner glory. Whether in athletic contests or bloody battle, Champions strive for the crown of the victor.":
		"Le Champion se concentre sur le développement de la prouesse martiale dans une quête inlassable de la victoire. Les Champions allient entraînement rigoureux et excellence physique pour porter des coups dévastateurs, supporter les périls et cueillir la gloire. Que ce soit lors de compétitions athlétiques ou de batailles sanglantes, les Champions aspirent à la couronne du vainqueur.",
	"Your attack rolls with weapons and Unarmed Strikes can score a {@variantrule Critical Hit|XPHB} on a roll of 19 or 20 on the {@dice d20}.":
		"Vos jets d'attaque avec des armes et les {@variantrule Unarmed Strike|XPHB|Frappes sans arme} peuvent infliger un {@variantrule Critical Hit|XPHB|coup critique} sur un jet de 19 ou 20 au {@dice d20}.",
	"Thanks to your athleticism, you have {@variantrule Advantage|XPHB} on {@variantrule Initiative|XPHB} rolls and Strength ({@skill Athlétisme|XPHB}) checks.":
		"Grâce à votre athlétisme, vous avez un {@variantrule Advantage|XPHB|avantage} aux jets d'{@variantrule Initiative|XPHB|initiative} et aux tests de Force ({@skill Athlétisme|XPHB}).",
	"In addition, immediately after you score a {@variantrule Critical Hit|XPHB}, you can move up to half your {@variantrule Speed|XPHB} without provoking {@action Attaque d'opportunité|XPHB|Opportunity Attacks}.":
		"En outre, immédiatement après avoir infligé un {@variantrule Critical Hit|XPHB|coup critique}, vous pouvez vous déplacer sur la moitié de votre {@variantrule Speed|XPHB|vitesse} au maximum sans provoquer d'{@action Attaque d'opportunité|XPHB|attaques d'opportunité}.",
	"You gain another {@filter Fighting Style feat|feats|category=FS} of your choice.":
		"Vous gagnez un autre {@filter don de style de combat|feats|category=FS} de votre choix.",
	"The thrill of battle drives you toward victory. During combat, you can give yourself {@variantrule Heroic Inspiration|XPHB} whenever you start your turn without it.":
		"Le frisson du combat vous pousse vers la victoire. Pendant le combat, vous pouvez vous accorder une {@variantrule Heroic Inspiration|XPHB|Inspiration héroïque} chaque fois que vous commencez votre tour sans en avoir.",
	"Your attack rolls with weapons and Unarmed Strikes can now score a {@variantrule Critical Hit|XPHB} on a roll of 18\u201320 on the {@dice d20}.":
		"Vos jets d'attaque avec des armes et les {@variantrule Unarmed Strike|XPHB|Frappes sans arme} peuvent désormais infliger un {@variantrule Critical Hit|XPHB|coup critique} sur un jet de 18 à 20 au {@dice d20}.",
	"You attain the pinnacle of resilience in battle, giving you these benefits.":
		"Vous atteignez le sommet de la résilience au combat, ce qui vous confère ces avantages.",
	"You have {@variantrule Advantage|XPHB} on {@variantrule Death Saving Throw|XPHB|Death Saving Throws}. Moreover, when you roll 18\u201320 on a {@variantrule Death Saving Throw|XPHB}, you gain the benefit of rolling a 20 on it.":
		"Vous avez un {@variantrule Advantage|XPHB|avantage} aux {@variantrule Death Saving Throw|XPHB|jets de sauvegarde mortelle}. En outre, quand vous obtenez un 18 à 20 à un {@variantrule Death Saving Throw|XPHB|jet de sauvegarde mortelle}, vous bénéficiez de l'avantage d'avoir obtenu un 20.",
	"At the start of each of your turns, you regain {@variantrule Hit Points|XPHB} equal to 5 plus your Constitution modifier if you are {@status Meurtri|XPHB} and have at least 1 {@variantrule Hit Points|XPHB|Hit Point}.":
		"Au début de chacun de vos tours, vous récupérez des {@variantrule Hit Points|XPHB|points de vie} égaux à 5 plus votre modificateur de Constitution si vous êtes {@status Meurtri|XPHB} et que vous avez au moins 1 {@variantrule Hit Points|XPHB|point de vie}.",

	// Eldritch Knight (XPHB)
	"{@i Support Combat Skills with Arcane Magic}": "{@i Soutenez vos compétences de combat avec la magie occulte}",
	"Eldritch Knights combine the martial mastery common to all Fighters with a careful study of magic. Their spells both complement and extend their combat skills, providing additional protection to shore up their armor and also allowing them to engage many foes at once with explosive magic.":
		"Les Magelames allient la maîtrise martiale commune à tous les Guerriers à une étude minutieuse de la magie. Leurs sorts complètent et étendent leurs compétences de combat, offrant une protection supplémentaire pour renforcer leur armure et leur permettant aussi d'affronter de nombreux ennemis à la fois grâce à une magie explosive.",
	"You have learned to cast spells. See {@book chapter 7|XPHB|7} for the rules on spellcasting. The information below details how you use those rules as an Eldritch Knight.":
		"Vous avez appris à lancer des sorts. Consultez le {@book chapitre 7|XPHB|7} pour les règles du lancement de sorts. Les informations ci-dessous détaillent comment vous utilisez ces règles en tant que Magelame.",
	"You know two cantrips of your choice from the {@filter Wizard spell list|spells|class=Wizard} (see that class's section for its list). {@spell Ray of Frost|XPHB} and {@spell Shocking Grasp|XPHB} are recommended. Whenever you gain a Fighter level, you can replace one of these cantrips with another cantrip of your choice from the {@filter Wizard spell list|spells|class=Wizard}.":
		"Vous connaissez deux tours de magie de votre choix dans la {@filter liste de sorts de magicien|spells|class=Wizard} (voir la section de cette classe pour sa liste). {@spell Ray of Frost|XPHB} et {@spell Shocking Grasp|XPHB} sont recommandés. Chaque fois que vous gagnez un niveau de Guerrier, vous pouvez remplacer l'un de ces tours de magie par un autre tour de magie de votre choix issu de la {@filter liste de sorts de magicien|spells|class=Wizard}.",
	"When you reach Fighter level 10, you learn another Wizard cantrip of your choice.":
		"Quand vous atteignez le niveau 10 de Guerrier, vous apprenez un autre tour de magie de magicien de votre choix.",
	"The Eldritch Knight Spellcasting table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a {@variantrule Long Rest|XPHB}.":
		"La table Lancement de sorts du Magelame indique combien d'emplacements de sorts vous avez pour lancer vos sorts de niveau 1 ou supérieur. Vous récupérez tous les emplacements dépensés lorsque vous terminez un {@variantrule Repos long|XPHB|repos long}.",
	"You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose three level 1 spells from the {@filter Wizard spell list|spells|class=Wizard}. {@spell Burning Hands|XPHB}, {@spell Jump|XPHB}, and {@spell Shield|XPHB} are recommended.":
		"Vous préparez la liste des sorts de niveau 1 ou supérieur que vous pouvez lancer grâce à cette capacité. Pour commencer, choisissez trois sorts de niveau 1 dans la {@filter liste de sorts de magicien|spells|class=Wizard}. {@spell Burning Hands|XPHB}, {@spell Jump|XPHB} et {@spell Shield|XPHB} sont recommandés.",
	"The number of spells on your list increases as you gain Fighter levels, as shown in the Prepared Spells column of the Eldritch Knight Spellcasting table. Whenever that number increases, choose additional spells from the {@filter Wizard spell list|spells|class=Wizard} until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots. For example, if you're a level 7 Fighter, your list of prepared spells can include five Wizard spells of levels 1 and 2 in any combination.":
		"Le nombre de sorts dans votre liste augmente à mesure que vous gagnez des niveaux de Guerrier, comme l'indique la colonne Sorts préparés de la table Lancement de sorts du Magelame. Chaque fois que ce nombre augmente, choisissez des sorts supplémentaires dans la {@filter liste de sorts de magicien|spells|class=Wizard} jusqu'à ce que le nombre de sorts de votre liste corresponde à celui de la table. Les sorts choisis doivent être d'un niveau pour lequel vous avez des emplacements de sorts. Par exemple, si vous êtes un Guerrier de niveau 7, votre liste de sorts préparés peut comprendre cinq sorts de magicien de niveaux 1 et 2, en toute combinaison.",
	"Whenever you gain a Fighter level, you can replace one spell on your list with another Wizard spell for which you have spell slots.":
		"Chaque fois que vous gagnez un niveau de Guerrier, vous pouvez remplacer un sort de votre liste par un autre sort de magicien pour lequel vous avez des emplacements de sorts.",
	"Intelligence is your spellcasting ability for your Wizard spells.":
		"L'Intelligence est votre caractéristique de lancement de sorts pour vos sorts de magicien.",
	"You can use an {@item Arcane Focus|XPHB} as a {@variantrule Spellcasting Focus|XPHB} for your Wizard spells.":
		"Vous pouvez utiliser un {@item Instrument de focalisation arcanique|XPHB} comme {@variantrule Spellcasting Focus|XPHB|instrument de focalisation des sorts} pour vos sorts de magicien.",
	"You learn a ritual that creates a magical bond between yourself and one weapon. You perform the ritual over the course of 1 hour, which can be done during a {@variantrule Short Rest|XPHB}. The weapon must be within your reach throughout the ritual, at the conclusion of which you touch the weapon and forge the bond. The bond fails if another Fighter is bonded to the weapon or if the weapon is a magic item to which someone else is attuned.":
		"Vous apprenez un rituel qui crée un lien magique entre vous et une arme. Vous accomplissez le rituel pendant 1 heure, ce qui peut être fait pendant un {@variantrule Repos court|XPHB|repos court}. L'arme doit être à votre portée pendant toute la durée du rituel, à la fin duquel vous touchez l'arme et forgez le lien. Le lien échoue si un autre Guerrier est lié à l'arme ou si l'arme est un objet magique auquel quelqu'un d'autre est harmonisé.",
	"Once you have bonded a weapon to yourself, you can't be disarmed of that weapon unless you have the {@condition Incapable|XPHB} condition. If it is on the same plane of existence, you can summon that weapon as a {@variantrule Bonus Action|XPHB}, causing it to teleport instantly to your hand.":
		"Une fois que vous avez lié une arme à vous-même, on ne peut pas vous désarmer de cette arme, sauf si vous avez l'état {@condition Incapable|XPHB}. Si elle se trouve sur le même plan d'existence, vous pouvez invoquer cette arme à titre d'{@variantrule Action bonus|XPHB|action bonus}, la faisant instantanément se téléporter dans votre main.",
	"You can have up to two bonded weapons, but you can summon only one at a time with a {@variantrule Bonus Action|XPHB}. If you attempt to bond with a third weapon, you must break the bond with one of the other two.":
		"Vous pouvez avoir jusqu'à deux armes liées, mais vous ne pouvez en invoquer qu'une seule à la fois avec une {@variantrule Action bonus|XPHB|action bonus}. Si vous essayez de créer un lien avec une troisième arme, vous devez rompre le lien avec l'une des deux autres.",
	"When you take the {@action Attaque|XPHB} action on your turn, you can replace one of the attacks with a casting of one of your Wizard cantrips that has a casting time of an action.":
		"Quand vous utilisez l'action {@action Attaque|XPHB} pendant votre tour, vous pouvez remplacer l'une des attaques par le lancement de l'un de vos tours de magie de magicien dont le temps de lancement est une action.",
	"You learn how to make your weapon strikes undercut a creature's ability to withstand your spells. When you hit a creature with an attack using a weapon, that creature has {@variantrule Disadvantage|XPHB} on the next saving throw it makes against a spell you cast before the end of your next turn.":
		"Vous apprenez à faire en sorte que vos frappes d'arme minent la capacité d'une créature à résister à vos sorts. Quand vous touchez une créature avec une attaque au moyen d'une arme, cette créature a un {@variantrule Disadvantage|XPHB|désavantage} au prochain jet de sauvegarde qu'elle effectue contre un sort que vous lancez avant la fin de votre prochain tour.",
	"When you use your Action Surge, you can teleport up to 30 feet to an unoccupied space you can see. You can teleport before or after the additional action.":
		"Quand vous utilisez votre Explosion d'action, vous pouvez vous téléporter sur 9 mètres au maximum vers un espace inoccupé que vous pouvez voir. Vous pouvez vous téléporter avant ou après l'action supplémentaire.",
	"When you take the {@action Attaque|XPHB} action on your turn, you can replace two of the attacks with a casting of one of your level 1 or level 2 Wizard spells that has a casting time of an action.":
		"Quand vous utilisez l'action {@action Attaque|XPHB} pendant votre tour, vous pouvez remplacer deux des attaques par le lancement de l'un de vos sorts de magicien de niveau 1 ou 2 dont le temps de lancement est une action.",

	// Psi Warrior (XPHB)
	"{@i Augment Physical Might with Psionic Power}": "{@i Augmentez votre puissance physique avec le pouvoir psionique}",
	"Psi Warriors awaken the power of their minds to augment their physical might. They harness this psionic power to infuse their weapon strikes, lash out with telekinetic energy, and create barriers of mental force.":
		"Les Guerriers psioniques éveillent le pouvoir de leur esprit pour accroître leur puissance physique. Ils canalisent ce pouvoir psionique pour imprégner leurs frappes d'armes, fouetter avec l'énergie télékinétique et créer des barrières de force mentale.",
	"You harbor a wellspring of psionic energy within yourself. It is represented by your Psionic Energy Dice, which fuel powers you have from this subclass. The Psi Warrior Energy Dice table shows the die size and number of these dice you have when you reach certain Fighter levels.":
		"Vous abritez en vous un puits d'énergie psionique. Il est représenté par vos Dés d'énergie psionique, qui alimentent les pouvoirs que vous possédez grâce à cette sous-classe. La table Dés d'énergie psionique du Guerrier psionique indique la taille et le nombre de ces dés dont vous disposez lorsque vous atteignez certains niveaux de Guerrier.",
	"Die Size": "Taille du dé",
	"Number": "Nombre",
	"Any features in this subclass that use a Psionic Energy Die use only the dice from this subclass. Some of your powers expend the Psionic Energy Die, as specified in a power's description, and you can't use a power if it requires you to use a die when all your Psionic Energy Dice are expended.":
		"Toute capacité de cette sous-classe qui utilise un Dé d'énergie psionique n'utilise que les dés de cette sous-classe. Certains de vos pouvoirs dépensent le Dé d'énergie psionique, comme précisé dans la description du pouvoir, et vous ne pouvez pas utiliser un pouvoir nécessitant un dé si tous vos Dés d'énergie psionique sont dépensés.",
	"You regain one of your expended Psionic Energy Dice when you finish a {@variantrule Short Rest|XPHB}, and you regain all of them when you finish a {@variantrule Long Rest|XPHB}.":
		"Vous récupérez l'un de vos Dés d'énergie psionique dépensés lorsque vous terminez un {@variantrule Repos court|XPHB|repos court}, et vous les récupérez tous lorsque vous terminez un {@variantrule Repos long|XPHB|repos long}.",
	"When you or another creature you can see within 30 feet of you takes damage, you can take a {@variantrule Reaction|XPHB} to expend one Psionic Energy Die, roll the die, and reduce the damage taken by the number rolled plus your Intelligence modifier (minimum reduction of 1), as you create a momentary shield of telekinetic force.":
		"Quand vous ou une autre créature que vous pouvez voir à 9 mètres de vous ou moins subissez des dégâts, vous pouvez utiliser une {@variantrule Réaction|XPHB|réaction} pour dépenser un Dé d'énergie psionique, lancer ce dé et réduire les dégâts subis du résultat obtenu plus votre modificateur d'Intelligence (réduction minimale de 1), tandis que vous créez un bref bouclier de force télékinétique.",
	"You can propel your weapons with psionic force. Once on each of your turns, immediately after you hit a target within 30 feet of yourself with an attack and deal damage to it with a weapon, you can expend one Psionic Energy Die, rolling it and dealing Force damage to the target equal to the number rolled plus your Intelligence modifier.":
		"Vous pouvez propulser vos armes avec la force psionique. Une fois à chacun de vos tours, immédiatement après avoir touché une cible à 9 mètres de vous ou moins avec une attaque et lui avoir infligé des dégâts avec une arme, vous pouvez dépenser un Dé d'énergie psionique, le lancer et infliger des dégâts de force à la cible égaux au résultat obtenu plus votre modificateur d'Intelligence.",
	"You can move an object or a creature with your mind. As a {@action Magie|XPHB} action, choose one target you can see within 30 feet of yourself; the target must be a loose object that is Large or smaller or one willing creature other than you. You transport the target up to 30 feet to an unoccupied space you can see. Alternatively, if the target is a Tiny object, you can transport it to or from your hand.":
		"Vous pouvez déplacer un objet ou une créature par la pensée. À titre d'action {@action Magie|XPHB}, choisissez une cible que vous pouvez voir à 9 mètres de vous ou moins ; la cible doit être un objet libre de taille G ou inférieure ou une créature consentante autre que vous. Vous transportez la cible sur 9 mètres au maximum vers un espace inoccupé que vous pouvez voir. Sinon, si la cible est un objet de taille TP, vous pouvez la transporter vers ou depuis votre main.",
	"Once you take this action, you can't do so again until you finish a {@variantrule Short Rest|XPHB|Short} or {@variantrule Long Rest|XPHB} unless you expend a Psionic Energy Die (no action required) to restore your use of it.":
		"Une fois cette action effectuée, vous ne pouvez plus la refaire avant d'avoir terminé un {@variantrule Repos court|XPHB|repos court} ou un {@variantrule Repos long|XPHB|repos long}, sauf si vous dépensez un Dé d'énergie psionique (aucune action requise) pour récupérer votre utilisation.",
	"As a {@variantrule Bonus Action|XPHB}, you gain a {@variantrule Fly Speed|XPHB} equal to twice your {@variantrule Speed|XPHB} until the end of the current turn. Once you take this {@variantrule Bonus Action|XPHB}, you can't do so again until you finish a {@variantrule Short Rest|XPHB|Short} or {@variantrule Long Rest|XPHB} unless you expend a Psionic Energy Die (no action required) to restore your use of it.":
		"À titre d'{@variantrule Action bonus|XPHB|action bonus}, vous gagnez une {@variantrule Fly Speed|XPHB|vitesse de vol} égale au double de votre {@variantrule Speed|XPHB|vitesse} jusqu'à la fin du tour en cours. Une fois cette {@variantrule Action bonus|XPHB|action bonus} utilisée, vous ne pouvez plus la refaire avant d'avoir terminé un {@variantrule Repos court|XPHB|repos court} ou un {@variantrule Repos long|XPHB|repos long}, sauf si vous dépensez un Dé d'énergie psionique (aucune action requise) pour récupérer votre utilisation.",
	"When you deal damage to a target with your Psionic Strike, you can force the target to make a Strength saving throw ({@dc 8} plus your Intelligence modifier and {@variantrule Proficiency|XPHB|Proficiency Bonus}). On a failed save, you can give the target the {@condition À terre|XPHB} condition or transport it up to 10 feet horizontally.":
		"Quand vous infligez des dégâts à une cible avec votre Frappe psionique, vous pouvez obliger la cible à faire un jet de sauvegarde de Force ({@dc 8} plus votre modificateur d'Intelligence et votre {@variantrule Proficiency|XPHB|bonus de maîtrise}). En cas d'échec, vous pouvez donner à la cible l'état {@condition À terre|XPHB} ou la transporter sur 3 mètres au maximum horizontalement.",
	"You have {@variantrule Resistance|XPHB} to Psychic damage. Moreover, if you start your turn with the {@condition Charmé|XPHB} or {@condition Effrayé|XPHB} condition, you can expend a Psionic Energy Die (no action required) and end every effect on yourself giving you those conditions.":
		"Vous avez une {@variantrule Resistance|XPHB|résistance} aux dégâts psychiques. De plus, si vous commencez votre tour avec l'état {@condition Charmé|XPHB} ou {@condition Effrayé|XPHB}, vous pouvez dépenser un Dé d'énergie psionique (aucune action requise) et mettre fin à chaque effet sur vous qui vous confère ces états.",
	"You can shield yourself and others with telekinetic force. As a {@variantrule Bonus Action|XPHB}, you can choose creatures, including yourself, within 30 feet of yourself, up to a number of creatures equal to your Intelligence modifier (minimum of one creature). Each of the chosen creatures has {@variantrule Cover|XPHB|Half Cover} for 1 minute or until you have the {@condition Incapable|XPHB} condition.":
		"Vous pouvez vous protéger, vous et les autres, avec la force télékinétique. À titre d'{@variantrule Action bonus|XPHB|action bonus}, vous pouvez choisir des créatures, vous y compris, à 9 mètres de vous ou moins, jusqu'à un nombre de créatures égal à votre modificateur d'Intelligence (minimum une créature). Chacune des créatures choisies bénéficie d'une {@variantrule Cover|XPHB|demi-couverture} pendant 1 minute ou jusqu'à ce que vous ayez l'état {@condition Incapable|XPHB}.",
	"Once you use this feature, you can't do so again until you finish a {@variantrule Long Rest|XPHB} unless you expend a Psionic Energy Die (no action required) to restore your use of it.":
		"Une fois cette capacité utilisée, vous ne pouvez plus la refaire avant d'avoir terminé un {@variantrule Repos long|XPHB|repos long}, sauf si vous dépensez un Dé d'énergie psionique (aucune action requise) pour récupérer votre utilisation.",
	"You always have the {@spell Telekinesis|XPHB} spell prepared. With this feature, you can cast it without a spell slot or components, and your spellcasting ability for it is Intelligence. On each of your turns while you maintain {@status Concentration|XPHB} on it, including the turn when you cast it, you can make one attack with a weapon as a {@variantrule Bonus Action|XPHB}.":
		"Vous avez toujours le sort {@spell Telekinesis|XPHB|Télékinésie} préparé. Grâce à cette capacité, vous pouvez le lancer sans emplacement de sort ni composantes, et votre caractéristique de lancement de sorts pour ce sort est l'Intelligence. À chacun de vos tours pendant que vous maintenez la {@status Concentration|XPHB} sur lui, y compris le tour où vous le lancez, vous pouvez effectuer une attaque avec une arme à titre d'{@variantrule Action bonus|XPHB|action bonus}.",
	"Once you cast the spell with this feature, you can't do so in this way again until you finish a {@variantrule Long Rest|XPHB} unless you expend a Psionic Energy Die (no action required) to restore your use of it.":
		"Une fois que vous avez lancé le sort grâce à cette capacité, vous ne pouvez plus le faire de cette manière avant d'avoir terminé un {@variantrule Repos long|XPHB|repos long}, sauf si vous dépensez un Dé d'énergie psionique (aucune action requise) pour récupérer votre utilisation."
};

const dict = {...names, ...prose};

// keys whose string values must NOT be translated
const SKIP = new Set(['source', 'page', 'srd', 'srd52', 'basicRules', 'basicRules2024', 'hd',
	'proficiency', 'savingThrows', 'shortName', 'subclassShortName', 'reprintedAs', 'foundry',
	'spellcastingAbility', 'casterProgression', 'edition', 'internalCopies']);

let pipeLog = [];
function translatePipe(str, kind) {
	// e.g. "Name|Fighter||1" or "Name|Fighter||ShortName|SRC|lvl"
	const segs = str.split('|');
	if (segs.length < 2) return str;
	if (names[segs[0]]) segs[0] = names[segs[0]];
	if (segs[1] === 'Fighter') segs[1] = 'Guerrier';
	pipeLog.push(`${str} -> ${segs.join('|')}`);
	return segs.join('|');
}

function walk(node, key) {
	if (Array.isArray(node)) return node.map(v => (typeof v === 'string' && dict[v] !== undefined) ? dict[v] : walk(v, key));
	if (node && typeof node === 'object') {
		const out = {};
		for (const [k, v] of Object.entries(node)) {
			if (SKIP.has(k)) { out[k] = v; continue; }
			if (k === 'consumes') { out[k] = v; continue; }
			if (k === 'classFeatures' || k === 'subclassFeatures') {
				out[k] = v.map(el => {
					if (typeof el === 'string') return translatePipe(el, k);
					if (el && typeof el === 'object' && typeof el.classFeature === 'string') {
						return {...el, classFeature: translatePipe(el.classFeature, k)};
					}
					if (el && typeof el === 'object' && typeof el.subclassFeature === 'string') {
						return {...el, subclassFeature: translatePipe(el.subclassFeature, k)};
					}
					return el;
				});
				continue;
			}
			if (k === 'className' || k === 'subclassTitle') {
				out[k] = (typeof v === 'string' && dict[v]) ? dict[v] : v;
				continue;
			}
			if (typeof v === 'string') {
				out[k] = dict[v] !== undefined ? dict[v] : v;
				continue;
			}
			out[k] = walk(v, k);
		}
		return out;
	}
	return node;
}

const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const out = walk(data, null);
fs.writeFileSync(path, JSON.stringify(out, null, '\t') + '\n', 'utf8');

// Report untranslated English-looking strings
const englishRe = /\b(the|you|your|when|whenever|at|starting|feature|level|attack|maneuver|rest)\b/i;
const skipKeys = new Set(['source', 'classSource', 'subclassSource', 'shortName', 'subclassShortName', 'reprintedAs', 'id', 'id2', 'edition', 'date']);
const leftovers = [];
(function scan(node, key) {
	if (Array.isArray(node)) { node.forEach(v => scan(v, key)); return; }
	if (node && typeof node === 'object') {
		for (const [k, v] of Object.entries(node)) {
			if (skipKeys.has(k)) continue;
			if (k === 'consumes') continue;
			scan(v, k);
		}
		return;
	}
	if (typeof node === 'string' && englishRe.test(node) && !/^(Fighter|Battle Master)$/.test(node)) {
		leftovers.push(`${key}: ${node.slice(0, 120)}`);
	}
})(out, null);

console.log('Pipe translations:', pipeLog.length);
console.log('Leftover English-looking strings:', leftovers.length);
leftovers.forEach(l => console.log('  ' + l));
