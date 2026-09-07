# -*- coding: utf-8 -*-
import sys
sys.path.insert(0, r"D:\GitHub\radixhomework\5etools-src\data\class")
from _tr_util import tr_file

D_sidekick = {
 "Expert Sidekick": "Expert Sidekick",  # lookup name kept (class file English)
 "Spellcaster Sidekick": "Spellcaster Sidekick",
 "Warrior Sidekick": "Warrior Sidekick",
 "The Expert is a master of certain tasks or knowledge, favoring cunning over brawn. It might be a scout, a musician, a librarian, a clever street kid, a wily merchant, or a burglar.":
  "L'Expert maîtrise certaines tâches ou certains savoirs, privilégiant la ruse à la force brute. Il peut être un éclaireur, un musicien, un bibliothécaire, un gamin de rue débrouillard, un marchand rusé ou un cambrioleur.",
 "A sidekick who becomes a Spellcaster walks the paths of magic. The sidekick might be a hedge wizard, a priest, a soothsayer, a magical performer, or a person with magic in their veins.":
  "Un compagnon qui devient Lanceur de sortilèges emprunte les sentiers de la magie. Ce compagnon peut être un sorcier de campagne, un prêtre, une diseuse de bonne aventure, un artiste magicien ou une personne ayant la magie dans les veines.",
 "A Warrior sidekick grows in martial prowess as it fights by your side. It might be a soldier, a town guard, a battle-trained beast, or any other creature honed for combat.":
  "Un compagnon Guerrier accroît ses prouesses martiales en se battant à vos côtés. Il peut s'agir d'un soldat, d'un garde urbain, d'une bête dressée au combat ou de toute autre créature façonnée pour le combat.",
}

D_mystic = {
 "Mystic": "Mystique",
 "A human clad in simple robes walks along a forest path. A gang of goblins emerges from the brush, arrows trained on him, their smiles wide at their good fortune of finding such easy prey for the legion's slave pens. Their smiles turn to shrieks of terror as the traveler grows to giant size and leaps at them, his staff now a deadly cudgel.":
  "Un humain vêtu de robes simples chemine sur un sentier forestier. Une bande de gobelins surgit des fourrés, arcs bandés sur lui, arborant un large sourire devant tant de chance : voilà une proie bien facile pour les enclos à esclaves de la légion. Leurs sourires se muent en hurlements de terreur quand le voyageur grandit jusqu'à atteindre la taille d'un géant et bondit sur eux, son bâton devenu une redoutable gourde.",
 "The militia forms in ranks to prepare for the orcs' charge. The growling brutes howl their battle cries and surge forward. To their surprise, the human rabble holds its ground and fights with surprising ferocity. Suddenly, mindless fear clings to the orcs' minds and they, despite facing a far inferior foe, turn and run, never noticing the calm half-elf standing amid the militia and directing its efforts.":
  "La milice se forme en rangs pour préparer la charge des orcs. Les brutes grondantes hurlent leurs cris de guerre et se ruent à l'assaut. À leur grande surprise, la canaille humaine tient bon et se bat avec une férocité étonnante. Soudain, une peur irraisonnée s'empare des esprits des orcs et, bien qu'affrontant un adversaire bien inférieur, ils font demi-tour et prennent la fuite, sans jamais remarquer le demi-elfe calme qui se tient au milieu de la milice et en dirige les efforts.",
 "Baron von Ludwig was always proud of his grand library. Little did he know that each evening, a gnome laden with blank scrolls slipped past his guards each night and dutifully copied his most heavily guarded archives. When the duke's men arrived to arrest him for dealing with demons, he never guessed that the gnome scribe traveling with them had spent more time in his keep than he had over the past year.":
  "Le baron von Ludwig était toujours fier de sa grande bibliothèque. Il ignorait que, chaque soir, un gnome chargé de parchemins vierges se glissait outre ses gardes et copiait consciencieusement ses archives les plus jalousement gardées. Lorsque les hommes du duc vinrent l'arrêter pour commerce avec les démons, il ne se douta jamais que le scribe gnome qui les accompagnait avait passé plus de temps dans son donjon que lui au cours de l'année écoulée.",
 "These heroes are all mystics, followers of a strange and mysterious form of power. Mystics shun the world to turn their eyes inward, mastering the full potential of their minds and exploring their psyches before turning to face the world. Mystics are incredibly rare, and most prefer to keep the nature of their abilities secret. Using their inner, psychic strength, they can read minds, fade into invisibility, transform their bodies into living iron, and seize control of the physical world and bend it to their will.":
  "Ces héros sont tous des mystiques, adeptes d'une forme de pouvoir étrange et mystérieuse. Les mystiques se retirent du monde pour porter leur regard vers l'intérieur, maîtrisant tout le potentiel de leur esprit et explorant leur psyché avant de se tourner à nouveau vers le monde. Les mystiques sont d'une rareté incroyable, et la plupart préfèrent garder secret la nature de leurs capacités. En puisant dans leur force psychique intérieure, ils peuvent lire dans les pensées, se fondre dans l'invisibilité, transformer leur corps en fer vivant et prendre le contrôle du monde physique pour le plier à leur volonté.",
 "Hermits and Outcasts": "Ermits et parias",
 "Mystics are loners. Most discover the secrets of their power through vague references in tomes of lore or by ingratiating themselves to a master of the power.":
  "Les mystiques sont des solitaires. La plupart découvrent les secrets de leur pouvoir à travers de vagues références dans des grimoires de savoir ancien ou en s'attirant les bonnes grâces d'un maître de ce pouvoir.",
 "In order to master their power, mystics must first master themselves. They spend months and years in quiet contemplation, exploring their minds and leaving nothing uncovered. During this time, they shun society and typically live as hermits at the edge of society. A mystic who studied under a master worked as a virtual slave, toiling away at mundane tasks in return for the occasional lesson or cryptic insight.":
  "Pour maîtriser leur pouvoir, les mystiques doivent d'abord se maîtriser eux-mêmes. Ils passent des mois et des années en contemplation silencieuse, explorant leur esprit sans rien laisser dans l'ombre. Durant cette période, ils fuient la société et vivent généralement en ermites, à la marge du monde. Un mystique qui a étudié sous la coupe d'un maître travaille comme un véritable esclave, s'échinant à des tâches ingrates en échange d'une leçon occasionnelle ou d'une révélation cryptique.",
 "When mystics finally master their power, they return to the world to broaden their horizons and practice their craft. Some mystics prefer to remain isolated, but those who become adventurers aren't content to remain on the fringe of the world.":
  "Lorsque les mystiques maîtrisent enfin leur pouvoir, ils reviennent au monde pour élargir leurs horizons et exercer leur art. Certains mystiques préfèrent rester isolés, mais ceux qui deviennent aventuriers ne se contentent pas de demeurer en marge du monde.",
 "Eccentric Minds": "Esprits excentriques",
 "In order to maintain the strict discipline and intense self-knowledge needed to tap into their power, mystics develop a variety of practices to keep their focus sharp.":
  "Afin de maintenir la discipline stricte et la connaissance intense d'eux-mêmes nécessaires pour puiser dans leur pouvoir, les mystiques développent toutes sortes de pratiques pour aiguiser leur concentration.",
 "These practices are reflected in taboos and quirks, strange little behaviors that govern a mystic's actions. These quirks are oaths or behavioral tics that help keep mystics in the proper frame of mind while maintaining perfect control over their minds and bodies.":
  "Ces pratiques se traduisent par des tabous et des bizarreries, d'étranges petits comportements qui régissent les gestes d'un mystique. Ces bizarreries sont des serments ou des tics comportementaux qui aident les mystiques à conserver le bon état d'esprit tout en gardant un contrôle parfait sur leur corps et leur esprit.",
 "While these taboos are harmless, they help cast mystics as outsiders. Few feel accepted by society, and fewer still care to become integrated with it. To mystics, the life of the mind is where they feel most at home.":
  "Bien qu'inoffensifs, ces tabous contribuent à faire des mystiques des marginaux. Peu se sentent acceptés par la société, et moins encore tiennent à s'y intégrer. Pour les mystiques, c'est dans la vie de l'esprit qu'ils se sentent chez eux.",
 "Selecting Quirks": "Choisir des bizarreries",
 "To add some texture to your mystic, consider the quirks your character has acquired. These behaviors have no game effect, but your character might become irritated or upset if forced to break them. They're a great roleplaying tool to add character to the game. You can roll on or pick from the table below, or create your own quirks. Aim to create two quirks, to give them more of a chance to come into play. Finally, consider why your character chose these behaviors. What do they say about your character's personality or background? Are they based on a specific incident or a belief?":
  "Pour donner plus de relief à votre mystique, pensez aux bizarreries qu'a acquises votre personnage. Ces comportements n'ont aucun effet sur le jeu, mais votre personnage pourrait s'irriter ou se contrarier si on le force à les enfreindre. C'est un excellent outil d'interprétation pour donner de la personnalité à la partie. Vous pouvez lancer le dé ou choisir dans la table ci-dessous, ou créer vos propres bizarreries. Efforcez-vous d'en créer deux, afin qu'elles aient plus de chances d'intervenir en jeu. Enfin, demandez-vous pourquoi votre personnage a adopté ces comportements. Que révèlent-ils de sa personnalité ou de son passé ? Sont-ils liés à un incident précis ou à une conviction ?",
 "Mystic Quirks": "Bizarreries du mystique",
 "Quirk": "Bizarrerie",
 "You never cut your hair.": "Vous ne vous coupez jamais les cheveux.",
 "You refuse to wear clothes of a specific color.": "Vous refusez de porter des vêtements d'une couleur en particulier.",
 "You never say your name.": "Vous ne dites jamais votre nom.",
 "You never wear footwear.": "Vous ne portez jamais de chaussures.",
 "You always wear a mask.": "Vous portez toujours un masque.",
 "You dye your hair bright blue or green.": "Vous teignez vos cheveux en bleu ou en vert vif.",
 "You pick a new name each day.": "Vous choisissez un nouveau nom chaque jour.",
 "You never immerse yourself in water.": "Vous ne vous immergez jamais dans l'eau.",
 "You sleep on bare earth.": "Vous dormez à même la terre.",
 "You never consume alcohol.": "Vous ne consommez jamais d'alcool.",
 "You wear a veil to conceal your face.": "Vous portez un voile pour dissimuler votre visage.",
 "You always wear a specific piece of clothing.": "Vous portez toujours un vêtement en particulier.",
 "You refuse to light fires.": "Vous refusez d'allumer des feux.",
 "You refuse to write things down, instead using pictograms.": "Vous refusez d'écrire quoi que ce soit et utilisez des pictogrammes à la place.",
 "You never sit on a chair, preferring to stand or sit on the floor.": "Vous ne vous asseyez jamais sur une chaise, préférant rester debout ou vous asseoir à même le sol.",
 "You never answer to any name but your own.": "Vous ne répondez jamais à un autre nom que le vôtre.",
 "You write down the name of each creature you slay, and name ones that are unnamed.": "Vous notez le nom de chaque créature que vous abattez et donnez un nom à celles qui n'en ont pas.",
 "You consume only water and raw vegetables.": "Vous ne consommez que de l'eau et des légumes crus.",
 "You spend any money you earn within 1 week of gaining it.": "Vous dépensez l'argent que vous gagnez dans la semaine qui suit son acquisition.",
 "You often speak to an imaginary companion, and act only with its blessing.": "Vous parlez souvent à un compagnon imaginaire et n'agissez qu'avec sa bénédiction.",
 "Creating a Mystic": "Créer un mystique",
 "When creating a mystic, consider your character's background. How did you become a mystic? What first drew you to this practice? Are you self-taught, or did you have a master? If you had a master, what is that relationship like?":
  "En créant un mystique, réfléchissez au passé de votre personnage. Comment êtes-vous devenu mystique ? Qu'est-ce qui vous a d'abord attiré vers cette pratique ? Êtes-vous autodidacte ou avez-vous eu un maître ? Si vous avez eu un maître, à quoi ressemble cette relation ?",
 "Consider also why you returned to the world from your hermitage. Did you leave someone or something behind when you took up your studies? Are you driven by revenge or some other motivation?":
  "Demandez-vous aussi pourquoi vous êtes revenu au monde après votre ermitage. Avez-vous laissé quelqu'un ou quelque chose derrière vous en vous consacrant à vos études ? Êtes-vous animé par la vengeance ou par une autre motivation ?",
 "Quick Build": "Création rapide",
 "You can make a mystic quickly by following these suggestions. First, make Intelligence your highest ability score, followed by Dexterity or Constitution. Second, choose the {@background Ermite} background.":
  "Vous pouvez créer un mystique rapidement en suivant ces suggestions. D'abord, faites de l'Intelligence votre meilleure caractéristique, suivie de la Dextérité ou de la Constitution. Ensuite, choisissez le passé {@background Ermite}.",
}

tr_file("fluff-class-sidekick.json", D_sidekick)
tr_file("fluff-class-mystic.json", {**D_mystic, "d20": "d20"})
