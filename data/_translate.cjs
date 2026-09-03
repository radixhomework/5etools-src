'use strict';
/* Translation engine for homecrafts.json / fluff-homecrafts.json (EN -> FR) */
const fs = require('fs');
const path = require('path');
const { DICT, COLORS_RAW } = require('./_dict.cjs');

// ------------------------------------------------------------------ colors
const COLORS = COLORS_RAW.slice().sort((a, b) => b[0].length - a[0].length);
const COLOR_RE = new RegExp('(^|[^\\w])(' + COLORS.map(c => c[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?=\\W|$)', 'g');
const colorMap = new Map(COLORS);
function applyColors(s) {
  return s.replace(COLOR_RE, (m, p1, p2) => p1 + colorMap.get(p2));
}

// ------------------------------------------------------------------ stitch tokens
const STITCHES = {
  'surface slst': ['maille coulée en surface', 'mailles coulées en surface'],
  'surface slip stitch': ['maille coulée en surface', 'mailles coulées en surface'],
  'crab stitch': ['maille crabe', 'mailles crabe'],
  'crab st': ['maille crabe', 'mailles crabe'],
  'spike st': ['maille spike', 'mailles spike'],
  'spike stitch': ['maille spike', 'mailles spike'],
  'dblpuff': ['double point fouetté', 'double points fouettés'],
  'hdc inc': ['augmentation de demi-bride', 'augmentations de demi-bride'],
  'hdc dec': ['diminution de demi-bride', 'diminutions de demi-bride'],
  'inc sc': ['augmentation de maille serrée', 'augmentations de maille serrée'],
  'inv dec': ['diminution invisible', 'diminutions invisibles'],
  'bphdc': ['demi-bride en relief arrière', 'demi-brides en relief arrière'],
  'htr': ['demi-double bride', 'demi-double brides'],
  'htc': ['demi-double bride', 'demi-double brides'],
  'fdc': ['bride de fondation', 'brides de fondation'],
  'fsc': ['maille serrée de fondation', 'mailles serrées de fondation'],
  'fpdc': ['bride en relief avant', 'brides en relief avant'],
  'bpdc': ['bride en relief arrière', 'brides en relief arrière'],
  'fptr': ['double bride en relief avant', 'double brides en relief avant'],
  'dcinc': ['augmentation de bride', 'augmentations de bride'],
  'dcdec': ['diminution de bride', 'diminutions de bride'],
  'dc3tog': ['3 brides fermées ensemble', '3 brides fermées ensemble'],
  'dc5tog': ['5 brides fermées ensemble', '5 brides fermées ensemble'],
  'dcXtog': ['brides fermées ensemble', 'brides fermées ensemble'],
  'slsts': ['mailles coulées', 'mailles coulées'],
  'slst': ['maille coulée', 'mailles coulées'],
  'sl st': ['maille coulée', 'mailles coulées'],
  'hdc': ['demi-bride', 'demi-brides'],
  'picot': ['picot', 'picots'],
  'popcorn': ['popcorn', 'popcorn'],
  'puff': ['point fouetté', 'points fouettés'],
  'inc': ['augmentation', 'augmentations'],
  'dec': ['diminution', 'diminutions'],
  'sc': ['maille serrée', 'mailles serrées'],
  'dc': ['bride', 'brides'],
  'tr': ['double bride', 'double brides'],
  'ch': ['maille chaînette', 'mailles chaînettes'],
};
const TOKEN_ORDER = Object.keys(STITCHES).sort((a, b) => b.length - a.length);

function esc(re) { return re.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function applyTokens(s) {
  for (const tok of TOKEN_ORDER) {
    const [sing, plu] = STITCHES[tok];
    const T = esc(tok);
    s = s.replace(new RegExp('(\\d+)\\s*' + T + '(?![a-zA-Z0-9])', 'g'), (m, n) => `${n} ${parseInt(n, 10) === 1 ? sing : plu}`);
    const pref = /^[0-9]/.test(sing) ? sing : '1 ' + sing;
    s = s.replace(new RegExp('(?<![\\w-])' + T + '(?![a-zA-Z0-9])', 'gi'), pref);
  }
  // token-first form: "Ch46", "ch16" (token followed by count)
  s = s.replace(/(?<![\w-])(ch)(\d+)(?![a-zA-Z0-9])/gi, (m, t, n) => `${n} ${parseInt(n, 10) === 1 ? 'maille chaînette' : 'mailles chaînettes'}`);
  return s;
}

// ------------------------------------------------------------------ phrase rules
const P = [
  // specific multi-word patterns that must win over generic chain rules
  [/fasten onto the next st in blo/g, 'raccordez le fil à la maille suivante dans le brin arrière'],
  [/In next st through both loops, \(ch1, dc5tog, ch1\) to create a bobble/g, 'Dans la maille suivante, à travers les deux brins, (1 maille chaînette, 5 brides fermées ensemble, 1 maille chaînette) pour former une noisette'],
  [/1sc in top of bobble/g, '1 maille serrée dans le haut de la noisette'],
  [/before the beginning of Subrow/g, 'avant le début du Sous-rang'],
  [/then stitch an additional/g, 'puis ajoutez'],
  [/then stich an additional/g, 'puis ajoutez'],
  [/to finish the round/g, 'pour terminer le tour'],
  [/sc into 2nd ch from hook/g, '1 maille serrée dans la 2e maille chaînette à partir du crochet'],
  [/slst in 3rd ch from hook/g, '1 maille coulée dans la 3e maille chaînette à partir du crochet'],
  [/sc in 2nd ch from hook and across/g, '1 maille serrée dans la 2e maille chaînette à partir du crochet puis dans chaque maille'],
  [/dc3tog in the same stitch/g, '3 brides fermées ensemble dans la même maille'],
  [/dc5tog in the same stitch/g, '5 brides fermées ensemble dans la même maille'],
  [/ in corner space/g, " dans l'espace d'angle"],
  [/in the next unworked st from/g, 'dans la maille non travaillée suivante du'],
  [/in same st as first sc of this row/g, 'dans la même maille que la première maille serrée de ce rang'],
  [/in the next stitch and ch1/g, 'dans la maille suivante et 1 maille chaînette'],
  [/across until last st/g, 'sur tout le rang jusqu\u2019à la dernière maille'],
  [/dc in last st/g, '1 bride dans la dernière maille'],
  [/dc in first st/g, '1 bride dans la première maille'],
  [/hdc in first st/g, '1 demi-bride dans la première maille'],
  [/dcinc in first st/g, '1 augmentation de bride dans la première maille'],
  [/ in first st\b/g, ' dans la première maille'],
  [/ in next st\b/g, ' dans la maille suivante'],
  [/ in same st\b/g, ' dans la même maille'],
  [/ in last st\b/g, ' dans la dernière maille'],
  [/slst to first st/g, '1 maille coulée dans la première maille'],
  [/slst to close\./g, '1 maille coulée pour fermer.'],
  [/Slst to close\./g, '1 maille coulée pour fermer.'],
  [/slst to close\b/g, '1 maille coulée pour fermer'],
  [/Slst to close\b/g, '1 maille coulée pour fermer'],
  [/ in next\b/g, ' dans la suivante'],
  [/in the side of Rang/g, 'dans le côté du Rang'],
  [/in the side of Row/g, 'dans le côté du Rang'],
  [/ on Tour (\d+)/g, ' au Tour $1'],
  [/ on Rang (\d+)/g, ' au Rang $1'],
  [/on Rnd (\d+)/g, 'au Tour $1'],
  [/on Row (\d+)/g, 'au Rang $1'],
  [/ made /g, ' faite '],
  [/Working in the 3rd loop of the previous row's hdc stitches,/g, 'En travaillant dans la 3e boucle des demi-brides du rang précédent,'],

  // "With {@b X}," color prefixes
  [/With \{@b ([A-G]|MC)\}, /g, 'Avec {@b $1}, '],
  [/With \{@b (Black|Pink|Cream)\}, /g, 'Avec du {@b $1}, '],
  [/Round (\d+)/g, 'Tour $1'],

  // rounds / rows labels
  [/Rnds (\d+)–(\d+) \((\d+) rounds\)/g, 'Tours $1–$2 ($3 tours)'],
  [/Rnds (\d+)–(\d+)/g, 'Tours $1–$2'],
  [/Rnd (\d+)/g, 'Tour $1'],
  [/Rows (\d+)–(\d+)/g, 'Rangs $1–$2'],
  [/Row (\d+)/g, 'Rang $1'],
  [/Subrow (\d+)([A-Z])\b/g, 'Sous-rang $1$2'],
  [/Step (\d+)/g, 'Étape $1'],
  [/Edge (\d+)([ab])\b/g, 'Bord $1$2'],
  [/\bEdge (\d)\b/g, 'Bord $1'],

  // chain basics
  [/2nd ch from (the |your )?hook/g, '2e maille chaînette à partir du crochet'],
  [/3rd ch from (the |your )?hook/g, '3e maille chaînette à partir du crochet'],
  [/4th chain from hook/g, '4e maille chaînette à partir du crochet'],
  [/2nd (ch|chain) from (the |your )?hook/g, '2e maille chaînette à partir du crochet'],
  [/3rd back bump space from the hook/g, '3e espace de bosse arrière à partir du crochet'],
  [/from hook/g, 'à partir du crochet'],
  [/working back, /g, 'revenez ensuite sur la chaînette, '],
  [/working in the back bumps of the chain (?:stitches|spaces)/g, 'en travaillant dans les bosses arrière des mailles chaînettes'],
  [/the back bumps of the chain/g, 'les bosses arrière de la chaînette'],
  [/back bumps/g, 'bosses arrière'],
  [/the ch1 space/g, 'l\u2019espace de la maille chaînette'],
  [/the ch1\b/g, 'la maille chaînette'],
  [/counts as first sc/g, 'compte comme la première maille serrée'],
  [/counts as first hdc/g, 'compte comme la première demi-bride'],
  [/counts as first dc/g, 'compte comme la première bride'],
  [/counts as first 2 dc/g, 'compte comme les 2 premières brides'],
  [/does not count as first sc/g, 'ne compte pas comme la première maille serrée'],
  [/does not count as first hdc/g, 'ne compte pas comme la première demi-bride'],
  [/does not count as first dc/g, 'ne compte pas comme la première bride'],
  [/does not count as first st/g, 'ne compte pas comme la première maille'],
  [/make a magic ring/g, 'faites un anneau magique'],
  [/Make a magic ring\./g, 'Faites un anneau magique.'],
  [/magic ring/g, 'anneau magique'],
  [/turn and /g, 'tournez et '],
  [/and turn/g, ' et tournez'],
  [/and do not turn/g, ' et ne tournez pas'],
  [/Do not turn\./g, 'Ne tournez pas.'],
  [/do not turn\./g, 'ne tournez pas.'],
  [/Do NOT ch1 and turn\./g, 'Ne faites NI maille chaînette NI tour.'],
  [/do NOT turn/g, 'NE tournez PAS'],
  [/do not turn/g, 'ne tournez pas'],
  [/do NOT place the wire yet/g, 'ne placez PAS encore le fil de fer'],
  [/Turn, /g, 'Tournez, '],
  [/in the round/g, 'en rond'],
  [/in the same ch sp/g, 'dans la même espace de mailles chaînettes'],
  [/in same ch sp/g, 'dans la même espace de mailles chaînettes'],
  [/the next ch sp/g, 'l\u2019espace de mailles chaînettes suivante'],
  [/next ch sp/g, 'espace de mailles chaînettes suivante'],
  [/to first ch sp/g, 'à la première espace de mailles chaînettes'],
  [/first ch sp/g, 'première espace de mailles chaînettes'],
  [/ch sp/g, 'espace de mailles chaînettes'],

  // fasten off family
  [/fasten off, leaving a long tail for sewing\./g, 'arrêtez le fil en laissant une longue longueur pour l\u2019assemblage.'],
  [/fasten off, leaving a long yarn tail for sewing\./g, 'arrêtez le fil en laissant une longue longueur de fil pour l\u2019assemblage.'],
  [/Fasten off, leaving a long yarn tail for sewing \(you will close the hole as you sew\)\./g, 'Arrêtez le fil en laissant une longue longueur de fil pour l\u2019assemblage (vous fermerez le trou pendant la couture).'],
  [/Fasten off and weave in loose ends\./g, 'Arrêtez le fil et rentrez les fils qui dépassent.'],
  [/Do not fasten off with/g, 'N\u2019arrêtez pas le fil avec'],
  [/do NOT fasten off/g, 'n\u2019arrêtez PAS le fil'],
  [/Do NOT fasten off/g, 'N\u2019arrêtez PAS le fil'],
  [/Do not fasten off/g, 'N\u2019arrêtez pas le fil'],
  [/do not fasten off/g, 'n\u2019arrêtez pas le fil'],
  [/Fasten off with a long yarn tail\./g, 'Arrêtez le fil en gardant une longue longueur de fil.'],
  [/Fasten off with a long tail\./g, 'Arrêtez le fil en gardant une longue longueur.'],
  [/Fasten off with a short tail/g, 'Arrêtez le fil en gardant une courte longueur'],
  [/fasten off with a long yarn tail/g, 'arrêtez le fil en gardant une longue longueur de fil'],
  [/Fasten off, leaving a long yarn tail for sewing \(/g, 'Arrêtez le fil en laissant une longue longueur de fil pour l\u2019assemblage ('],
  [/Fasten off, leaving a long tail for sewing\./g, 'Arrêtez le fil en laissant une longue longueur pour l\u2019assemblage.'],
  [/Fasten off, leaving a long tail for sewing/g, 'Arrêtez le fil en laissant une longue longueur pour l\u2019assemblage'],
  [/Fasten off, leaving a long tail\./g, 'Arrêtez le fil en laissant une longue longueur.'],
  [/Fasten off, leaving a long tail/g, 'Arrêtez le fil en laissant une longue longueur'],
  [/Fasten off, leaving a medium tail for sewing in place around each eye\./g, 'Arrêtez le fil en laissant une longueur moyenne pour fixer le tour de chaque œil.'],
  [/Fasten off, leaving a medium tail for sewing to the head\./g, 'Arrêtez le fil en laissant une longueur moyenne pour la couture sur la tête.'],
  [/Fasten off, leaving a medium tail for sewing the Beak to the Head\./g, 'Arrêtez le fil en laissant une longueur moyenne pour coudre le Bec sur la Tête.'],
  [/Fasten off, leaving a medium tail to sew the Eye Ridge over the Eye\./g, 'Arrêtez le fil en laissant une longueur moyenne pour coudre l\u2019Arête supraoculaire sur l\u2019œil.'],
  [/Fasten off, leaving a medium tail to sew the neck section to the back of the Head\./g, 'Arrêtez le fil en laissant une longueur moyenne pour coudre la section du cou à l\u2019arrière de la Tête.'],
  [/Fasten off, leaving a medium tail for sewing\./g, 'Arrêtez le fil en laissant une longueur moyenne pour l\u2019assemblage.'],
  [/Fasten off, leaving a medium tail\./g, 'Arrêtez le fil en laissant une longueur moyenne.'],
  [/Fasten off, leaving a medium yarn tail for sewing to the Head\./g, 'Arrêtez le fil en laissant une longueur de fil moyenne pour la couture sur la Tête.'],
  [/Fasten off, leaving a short tail to close the piece and weave in the ends\./g, 'Arrêtez le fil en laissant une courte longueur pour fermer la pièce, puis rentrez les fils.'],
  [/Fasten off, leaving a short tail to weave in or tuck inside the finger\./g, 'Arrêtez le fil en laissant une courte longueur à rentrer ou à glisser à l\u2019intérieur du doigt.'],
  [/Fasten off, leaving a short tail to weave or tuck inside the finger\./g, 'Arrêtez le fil en laissant une courte longueur à rentrer ou à glisser à l\u2019intérieur du doigt.'],
  [/Fasten off, leaving a short tail to weave in or tuck inside\./g, 'Arrêtez le fil en laissant une courte longueur à rentrer ou à glisser à l\u2019intérieur.'],
  [/Fasten off, leaving a short tail and set aside\./g, 'Arrêtez le fil en laissant une courte longueur et mettez de côté.'],
  [/Fasten off, leaving a short tail and stuff firmly\./g, 'Arrêtez le fil en laissant une courte longueur et bourrez fermement.'],
  [/Fasten off, leaving a short tail\./g, 'Arrêtez le fil en laissant une courte longueur.'],
  [/Fasten off, leaving a short tail, /g, 'Arrêtez le fil en laissant une courte longueur, '],
  [/Fasten off, leaving a short tail/g, 'Arrêtez le fil en laissant une courte longueur'],
  [/Fasten off, leaving an extra long yarn tail to sew the Wing Panels to the Wing Supports\./g, 'Arrêtez le fil en laissant une très longue longueur de fil pour coudre les Panneaux d\u2019aile sur les Étays d\u2019aile.'],
  [/Fasten off, leaving a long tail to attach to the Body Base\./g, 'Arrêtez le fil en laissant une longue longueur pour la fixation sur la Base du corps.'],
  [/Fasten off, leaving a long tail to sew the Belly Scales to the Body\./g, 'Arrêtez le fil en laissant une longue longueur pour coudre les Écailles ventrales au corps.'],
  [/Fasten off leaving a long tail for sewing and for stitching claws on each toe\./g, 'Arrêtez le fil en laissant une longue longueur pour l\u2019assemblage et pour broder des griffes sur chaque orteil.'],
  [/Fasten off, leaving a long tail for sewing and for stitching claws on each toe\./g, 'Arrêtez le fil en laissant une longue longueur pour l\u2019assemblage et pour broder des griffes sur chaque orteil.'],
  [/Fasten off, leaving a long tail for sewing \(you will close the hole as you sew\)\./g, 'Arrêtez le fil en laissant une longue longueur pour l\u2019assemblage (vous fermerez le trou pendant la couture).'],
  [/Fasten off and weave in ends\./g, 'Arrêtez le fil et rentrez les fils.'],
  [/Fasten off and weave in any ends\./g, 'Arrêtez le fil et rentrez tous les fils.'],
  [/Fasten off and weave in all ends\./g, 'Arrêtez le fil et rentrez tous les fils.'],
  [/Fasten off, weave in ends\./g, 'Arrêtez le fil et rentrez les fils.'],
  [/Fasten off, weave in all ends\./g, 'Arrêtez le fil et rentrez tous les fils.'],
  [/Fasten off, and weave in the tail\./g, 'Arrêtez le fil et rentrez le fil.'],
  [/Fasten off and weave in the tail\./g, 'Arrêtez le fil et rentrez le fil.'],
  [/Fasten off, and weave in the end\./g, 'Arrêtez le fil et rentrez le fil.'],
  [/Fasten off and weave in the end\./g, 'Arrêtez le fil et rentrez le fil.'],
  [/weave in any loose ends\./g, 'rentrez tous les fils qui dépassent.'],
  [/weave in loose ends\./g, 'rentrez les fils qui dépassent.'],
  [/weave in your ends\./g, 'rentrez vos fils.'],
  [/weave in your yarn tails\./g, 'rentrez vos fils.'],
  [/weave in the yarn tails\./g, 'rentrez les fils.'],
  [/weave in the ends\./g, 'rentrez les fils.'],
  [/weave in any ends\./g, 'rentrez tous les fils.'],
  [/weave in all ends\./g, 'rentrez tous les fils.'],
  [/weave in ends\./g, 'rentrez les fils.'],
  [/weave in the end\./g, 'rentrez le fil.'],
  [/Weave in ends\./g, 'Rentrez les fils.'],
  [/Weave in all the ends\./g, 'Rentrez tous les fils.'],
  [/Weave in any ends\./g, 'Rentrez tous les fils.'],
  [/Weave in the end once the Beak is attached\./g, 'Rentrez le fil une fois le Bec cousu.'],
  [/fasten off and weave in all ends\./g, 'arrêtez le fil et rentrez tous les fils.'],
  [/Fasten off\./g, 'Arrêtez le fil.'],
  [/fasten off\./g, 'arrêtez le fil.'],
  [/Fasten off and close up the last 8 stitches with the yarn tail\./g, 'Arrêtez le fil et fermez les 8 dernières mailles avec le fil.'],
  [/Fasten off and close up the last 6 stitches with yarn tail\./g, 'Arrêtez le fil et fermez les 6 dernières mailles avec le fil.'],
  [/Fasten off, sew hole closed, and weave in the tail\./g, 'Arrêtez le fil, fermez le trou et rentrez le fil.'],
  [/Fasten off, sew opening closed, and weave in ends\./g, 'Arrêtez le fil, fermez l\u2019ouverture et rentrez les fils.'],
  [/Fasten off and sew hole closed, leaving a long tail for sewing\./g, 'Arrêtez le fil et fermez le trou en laissant une longue longueur pour l\u2019assemblage.'],
  [/Fasten off {@b B}\./g, 'Arrêtez le fil {@b B}.'],
  [/Do not cut the yarn yet\./g, 'Ne coupez pas encore le fil.'],
  [/do not cut off\./g, 'sans le couper.'],
  [/Now you can cut the {@b Cream} color\./g, 'Vous pouvez maintenant couper le fil {@b Crème}.'],

  // colors of yarn / attach yarn
  [/Change to \{@b ([A-G]|MC)\}\./g, 'Passez à {@b $1}.'],
  [/Change to C\./g, 'Passez à C.'],
  [/Continue in \{@b A\}\./g, 'Continuez avec {@b A}.'],
  [/Change to \{@b ([A-G])\} at the end of (Row|Rnd) (\d+)/g, 'Changez pour {@b $1} à la fin de $2 $3'],
  [/Change to \{@b B\} at the end of Row/g, 'Changez pour {@b B} à la fin du Rang'],
  [/attach yarn/g, 'joignez le fil'],
  [/Attach yarn/g, 'Joignez le fil'],
  [/fasten onto/g, 'raccordez le fil à'],
  [/Fasten onto/g, 'Raccordez le fil à'],
  [/Pick \{@b A\} up again,/g, 'Reprenez {@b A},'],
  [/Pick up again with {@b A}\./g, 'Reprenez avec {@b A}.'],
  [/carry the unused color inside the stitches throughout the row/g, 'en portant la couleur inactive à l\u2019intérieur des mailles tout au long du rang'],
  [/Carry {@b A} along the straight edge of your work/g, 'Portez {@b A} le long du bord droit de votre ouvrage'],
  [/each time you ch1 and turn with/g, 'chaque fois que vous faites 1 maille chaînette et tournez avec'],
  [/Do not carry {@b A} through all the B rows\./g, 'Ne portez pas {@b A} sur tous les rangs B.'],

  // working styles
  [/work through back loop only/gi, 'travaillez dans le brin arrière uniquement'],
  [/work through front loop only/gi, 'travaillez dans le brin avant uniquement'],
  [/(?<![a-z0-9])sc across/gi, '1 maille serrée dans chaque maille sur tout le rang'],
  [/(?<![a-z0-9])dc across/gi, '1 bride dans chaque maille sur tout le rang'],
  [/(?<![a-z0-9])hdc across/gi, '1 demi-bride dans chaque maille sur tout le rang'],
  [/(?<![a-z0-9])dc in first st/g, '1 bride dans la première maille'],
  [/(?<![a-z0-9])hdc in first st/g, '1 demi-bride dans la première maille'],
  [/(?<![a-z0-9])sc around/gi, '1 maille serrée dans chaque maille tout autour'],
  [/(?<![a-z0-9])hdc around/gi, '1 demi-bride dans chaque maille tout autour'],
  [/(?<![a-z0-9])bphdc around/gi, '1 demi-bride en relief arrière dans chaque maille tout autour'],
  [/slst in each stitch around/gi, '1 maille coulée dans chaque maille tout autour'],
  [/(?<![a-z0-9])sc blo/gi, 'maille serrée dans le brin arrière'],
  [/(?<![a-z0-9])sc flo/gi, 'maille serrée dans le brin avant'],
  [/(?<![a-z0-9])hdc blo/gi, 'demi-bride dans le brin arrière'],
  [/(?<![a-z0-9])hdc flo/gi, 'demi-bride dans le brin avant'],
  [/(?<![a-z0-9])slst blo/gi, 'maille coulée dans le brin arrière'],
  [/(?<![a-z0-9])slst flo/gi, 'maille coulée dans le brin avant'],
  [/(?<![a-z0-9])dc blo/gi, 'bride dans le brin arrière'],
  [/\bBlo \[/g, 'Dans le brin arrière, ['],
  [/\bFlo \[/g, 'Dans le brin avant, ['],
  [/Blo\/Flo \[/g, 'En brin arrière/brin avant, ['],
  [/\bblo\b/g, 'dans le brin arrière'],
  [/\bflo\b/g, 'dans le brin avant'],
  [/back loops only/g, 'brins arrière uniquement'],
  [/front loops only/g, 'brins avant uniquement'],
  [/both loops/g, 'les deux brins'],
  [/unworked blo/g, 'brins arrière non travaillés'],
  [/unworked flo/g, 'brins avant non travaillés'],
  [/open front loop spaces/g, 'espaces de brins avant libres'],
  [/front loop spaces/g, 'espaces de brins avant'],
  [/the front loop of/g, 'le brin avant de'],
  [/back loop of/g, 'brin arrière de'],
  [/front loop of/g, 'brin avant de'],
  [/front loops/g, 'brins avant'],
  [/back loops/g, 'brins arrière'],

  // skipping / same / next
  [/sk slst/gi, 'sautez la maille coulée'],
  [/Skip the slst/g, 'Sautez la maille coulée'],
  [/skip the slst/g, 'sautez la maille coulée'],
  [/sk st/g, 'sautez 1 maille'],
  [/Sk st/g, 'Sautez 1 maille'],
  [/\bSk(\d+)\b/g, 'sautez $1 mailles'],
  [/in the same stitch/g, 'dans la même maille'],
  [/in same stitch/g, 'dans la même maille'],
  [/in the same space/g, 'dans le même espace'],
  [/in same space/g, 'dans le même espace'],
  [/the same stitch as/g, 'la même maille que'],
  [/the same space as/g, 'le même espace que'],
  [/in the marked stitch/g, 'dans la maille marquée'],
  [/in the marked st/g, 'dans la maille marquée'],
  [/the marked stitch/g, 'la maille marquée'],
  [/marked stitch/g, 'maille marquée'],
  [/the next stitch on/g, 'la maille suivante sur'],
  [/the next stitch/g, 'la maille suivante'],
  [/next stitch/g, 'maille suivante'],
  [/the next st\b/g, 'la maille suivante'],
  [/the next space/g, 'l\u2019espace suivante'],
  [/next space/g, 'espace suivante'],
  [/the last stitch/g, 'la dernière maille'],
  [/last stitch/g, 'dernière maille'],
  [/the last st\b/g, 'la dernière maille'],
  [/last st\b/g, 'dernière maille'],
  [/the last ch\b/g, 'la dernière maille chaînette'],
  [/last available space/g, 'dernier espace disponible'],
  [/each stitch/g, 'chaque maille'],
  [/each st\b/g, 'chaque maille'],
  [/the first stitch/g, 'la première maille'],
  [/first stitch/g, 'première maille'],
  [/the first sc in/g, 'la première maille serrée du'],
  [/the first st\b/g, 'la première maille'],
  [/first st\b/g, 'première maille'],

  // assembly verbs
  [/Stuff firmly/g, 'Bourrez fermement'],
  [/stuff firmly/g, 'bourrez fermement'],
  [/stuff as you go/g, 'bourrez au fur et à mesure'],
  [/stuffing as you work/g, 'en bourrant au fur et à mesure'],
  [/stuffing as you go/g, 'en bourrant au fur et à mesure'],
  [/Stuff as you pin\./g, 'Bourrez pendant l\u2019épinglage.'],
  [/stuff lightly/g, 'bourrez légèrement'],
  [/Stuff lightly/g, 'Bourrez légèrement'],
  [/Do NOT stuff\./g, 'NE bourrez PAS.'],
  [/do not stuff/g, 'ne bourrez pas'],
  [/Stuff the/g, 'Bourrez le'],
  [/stuff the/g, 'bourrez le'],
  [/Stuff and continue stuffing as you work\./g, 'Bourrez et continuez de bourrer au fur et à mesure.'],
  [/Begin stuffing/g, 'Commencez à bourrer'],
  [/begin stuffing/g, 'commencez à bourrer'],
  [/continue stuffing/g, 'continuez de bourrer'],
  [/Finish stuffing/g, 'Terminez de bourrer'],
  [/finish stuffing/g, 'terminez de bourrer'],
  [/polyester fiberfill/g, 'ouate de polyester'],
  [/polyfill/g, 'ouate de polyester'],
  [/stitch marker/g, 'marqueur'],
  [/Stitch marker/g, 'Marqueur'],
  [/safety eye/g, 'œil de sécurité'],
  [/safety eyes/g, 'yeux de sécurité'],
  [/tapestry needle/g, 'aiguille à tapisserie'],
  [/Tapestry needle/g, 'Aiguille à tapisserie'],
  [/needle-nose pliers/g, 'pince à becs fins'],
  [/\bpliers\b/g, 'pince'],
  [/\bPliers\b/g, 'Pince'],
  [/yarn over/gi, 'faites un jeté'],
  [/pull up a loop/g, 'tirez une boucle'],
  [/pull through all loops on (?:the )?hook/g, 'faites-le passer à travers toutes les boucles sur le crochet'],
  [/pull through all 3 loops on your hook/g, 'faites-le passer à travers les 3 boucles sur votre crochet'],
  [/pull through 2 loops/g, 'faites-le passer à travers 2 boucles'],
  [/pull through remaining 2 loops on hook/g, 'faites-le passer à travers les 2 boucles restantes sur le crochet'],
  [/pull through remaining 3 loops/g, 'faites-le passer à travers les 3 boucles restantes'],
  [/loops on hook/g, 'boucles sur le crochet'],
  [/loops on the hook/g, 'boucles sur le crochet'],
  [/on hook\)/g, 'sur le crochet)'],
  [/on the hook\)/g, 'sur le crochet)'],
  [/insert hook into/g, 'insérez le crochet dans'],
  [/insert the hook into/g, 'insérez le crochet dans'],
  [/insert the hook from/g, 'insérez le crochet en passant de'],
  [/insert your hook into/g, 'insérez votre crochet dans'],
  [/insert crochet hook/g, 'insérez le crochet'],
  [/insert the crochet hook into/g, 'insérez le crochet dans'],
  [/remove hook from loop/g, 'retirez le crochet de la boucle'],
  [/insert hook through scale/g, 'insérez le crochet dans une écaille'],
  [/inserting hook through a scale/g, 'en insérant le crochet dans une écaille'],
  [/insert your hook/g, 'insérez votre crochet'],
  [/grab loop and pull through/g, 'attrapez la boucle et faites-la passer à travers'],

  // piece count stamps
  [/MAKE 2 EACH OF TOP AND BOTTOM PADS/g, 'À RÉALISER 2 EXEMPLAIRES DE CHAQUE COUSSINET, SUPÉRIEUR ET INFÉRIEUR'],
  [/MAKE 10, 2 IN EACH EYE COLOR/g, 'À RÉALISER 10, SOIT 2 DANS CHAQUE COULEUR D\u2019YEUX'],
  [/MAKE 2 BORDERS ON EACH PANEL/g, 'À RÉALISER 2 BORDS PAR PANNEAU'],
  [/MAKE 4, 2 EXTERIOR AND 2 INTERIOR/g, 'À RÉALISER 4, SOIT 2 EXTÉRIEURS ET 2 INTÉRIEURS'],
  [/MAKE AN UPPER AND LOWER SET/g, 'À RÉALISER UN ENSEMBLE SUPÉRIEUR ET UN INFÉRIEUR'],
  [/MAKE 1 BLO AND 1 FLO/g, 'À RÉALISER 1 EN BRIN ARRIÈRE ET 1 EN BRIN AVANT'],
  [/MAKE 1 PER WING/g, 'À RÉALISER 1 PAR AILE'],
  [/MAKE 3 PER WING/g, 'À RÉALISER 3 PAR AILE'],
  [/MAKE 2/g, 'À RÉALISER 2'],
  [/MAKE 4/g, 'À RÉALISER 4'],
  [/MAKE 10/g, 'À RÉALISER 10'],
  [/MAKE 20/g, 'À RÉALISER 20'],
  [/CONTINUED/g, 'SUITE'],

  // orientation / sides
  [/right sides facing outward/g, 'endroits vers l\u2019extérieur'],
  [/front sides facing outward/g, 'endroits vers l\u2019extérieur'],
  [/right side facing inwards/g, 'endroit vers l\u2019intérieur'],
  [/wrong side facing outwards/g, 'envers vers l\u2019extérieur'],
  [/right side facing you/g, 'endroit vers vous'],
  [/with the front facing outward/g, 'avec l\u2019endroit vers l\u2019extérieur'],
  [/the right side of/g, 'le côté droit de'],
  [/the left side of/g, 'le côté gauche de'],
  [/working up the right side/gi, 'en remontant le long du côté droit'],
  [/working down the left side/gi, 'en redescendant le long du côté gauche'],
  [/Working up the side/g, 'En remontant le long du côté'],
  [/working up the side/g, 'en remontant le long du côté'],
  [/Working down the side/g, 'En redescendant le long du côté'],
  [/working down the side/g, 'en redescendant le long du côté'],
  [/Working across the left side/g, 'En travaillant sur le côté gauche'],
  [/working across the left side/g, 'en travaillant sur le côté gauche'],
  [/Working across the right side/g, 'En travaillant sur le côté droit'],
  [/working across the right side/g, 'en travaillant sur le côté droit'],
  [/Working across the bottom side/g, 'En travaillant sur le bord inférieur'],
  [/working across the bottom side/g, 'en travaillant sur le bord inférieur'],
  [/the bottom side of/g, 'le bord inférieur de'],
  [/bottom side of/g, 'bord inférieur de'],
  [/up the side/g, 'le long du côté'],
  [/down the side/g, 'le long du côté'],
  [/the side of Row/g, 'le côté du Rang'],
  [/side of Row/g, 'côté du Rang'],
  [/in the side of Row/g, 'dans le côté du Rang'],
  [/on the side of Row/g, 'sur le côté du Rang'],
  [/along the side of Rows/g, 'le long du côté des Rangs'],
  [/on the side of Rows/g, 'sur le côté des Rangs'],
  [/the side edge/g, 'le bord latéral'],
  [/side edge/g, 'bord latéral'],
  [/up the collar/g, 'le long de l\u2019encolure'],
  [/down the collar/g, 'le long de l\u2019encolure'],
  [/the collar/g, 'l\u2019encolure'],
  [/along the bottom/g, 'le long du bas'],
  [/across the bottom/g, 'sur le bas'],
  [/\btop of\b/g, 'haut de'],
  [/\bbottom of\b/g, 'bas de'],
  [/the top/g, 'le haut'],
  [/the bottom/g, 'le bas'],
  [/along the starting chain/g, 'le long de la chaînette de départ'],
  [/starting chain of Row/g, 'chaînette de départ du Rang'],
  [/the starting chain/g, 'la chaînette de départ'],
  [/starting chain/g, 'chaînette de départ'],
  [/the foundation chain/g, 'la chaînette de fondation'],
  [/opposite side of the foundation chain/g, 'côté opposé de la chaînette de fondation'],
  [/foundation chain/g, 'chaînette de fondation'],

  // folding / shaping
  [/in half lengthwise/g, 'en deux dans le sens de la longueur'],
  [/widthwise/g, 'dans le sens de la largeur'],
  [/Fold the Panel widthwise/g, 'Pliez le Panneau dans le sens de la largeur'],
  [/Fold in half/g, 'Pliez en deux'],
  [/fold the/g, 'pliez le'],
  [/Fold the/g, 'Pliez le'],
  [/flip the/g, 'retournez le'],
  [/Flip the/g, 'Retournez le'],
  [/flip your piece over/g, 'retournez votre pièce'],
  [/fold the edges in/g, 'recourbez les extrémités'],
  [/fold flat/g, 'pliez à plat'],
  [/folded flat/g, 'plié à plat'],
  [/Fold down/g, 'Repliez'],
  [/fold down/g, 'repliez'],
  [/flatten/gi, 'aplatissez'],
  [/flattened/g, 'aplati'],

  // sewing / pinning
  [/sew in place/gi, 'cousez en place'],
  [/sew into place/gi, 'cousez en place'],
  [/sew it in place/g, 'cousez-le en place'],
  [/sew them in place/g, 'cousez-les en place'],
  [/sew each one to the Body/g, 'cousez chacune au corps'],
  [/sew together/g, 'assemblez par couture'],
  [/Sew both pieces together/g, 'Cousez les deux pièces ensemble'],
  [/sew both pieces together/g, 'cousez les deux pièces ensemble'],
  [/sew closed/g, 'fermez par couture'],
  [/sew the hole closed/g, 'fermez le trou par couture'],
  [/sew hole closed/g, 'fermez le trou par couture'],
  [/sewn on evenly/g, 'cousus uniformément'],
  [/sewn in place/g, 'cousu en place'],
  [/sewing the Strips into place/g, 'la couture des Bandes en place'],
  [/sew the/g, 'cousez le'],
  [/Sew the/g, 'Cousez le'],
  [/sew the Strips in place on the chest/g, 'cousez les Bandes en place sur la poitrine'],
  [/to sew/g, 'pour coudre'],
  [/for sewing/g, 'pour l\u2019assemblage'],
  [/Pin the/g, 'Épinglez le'],
  [/pin the/g, 'épinglez le'],
  [/Pin in place/g, 'Épinglez en place'],
  [/pin in place/g, 'épinglez en place'],
  [/unpinned/g, 'non épinglée'],
  [/pinned in place/g, 'épinglées en place'],
  [/before you sew them on/g, 'avant de les coudre'],
  [/before you sew/g, 'avant de coudre'],
  [/as you sew/g, 'pendant la couture'],
  [/as you pin/g, 'pendant l\u2019épinglage'],
  [/while you work/g, 'pendant que vous travaillez'],
  [/while you attach them/g, 'pendant que vous les fixez'],
  [/before sewing/g, 'avant de coudre'],
  [/use the yarn tails to sew/g, 'utilisez les fils pour coudre'],
  [/use the remaining yarn tail to sew/g, 'utilisez le reste de fil pour coudre'],
  [/use the yarn tail to sew/g, 'utilisez le fil pour coudre'],
  [/using the yarn tail from/g, 'en utilisant le fil de'],
  [/using the tail from/g, 'en utilisant le fil de'],
  [/use the tail from/g, 'utilisez le fil de'],
  [/Save the tail from/g, 'Gardez le fil de'],
  [/using the rest of the length of yarn/g, 'en utilisant le reste de fil'],
  [/using a tapestry needle and the yarn tail/gi, 'à l\u2019aide d\u2019une aiguille à tapisserie et du fil'],
  [/Using a tapestry needle and the yarn tail end/g, 'À l\u2019aide d\u2019une aiguille à tapisserie et de l\u2019extrémité de fil'],
  [/With a tapestry needle and/g, 'Avec une aiguille à tapisserie et'],
  [/with a tapestry needle and/g, 'avec une aiguille à tapisserie et'],
  [/with a length of yarn in/g, 'avec une longueur de fil en'],
  [/with a long piece of yarn in/g, 'avec une grande longueur de fil en'],
  [/Using a 12 in\. \/ 30\.5 cm length of yarn in/g, 'Avec une longueur de 12 po / 30,5 cm de fil en'],
  [/using a 12 in\. \/ 30\.5 cm length of/g, 'à l\u2019aide d\u2019une longueur de 12 po / 30,5 cm de'],

  // wire / yarn material words
  [/lengths of wire/g, 'morceaux de fil de fer'],
  [/length of wire/g, 'morceau de fil de fer'],
  [/armature wire/g, 'fil de fer d\u2019armature'],
  [/floral wire/g, 'fil de fer floral'],
  [/craft wire/g, 'fil de fer créatif'],
  [/\bwire cutters\b/gi, 'pince coupante'],
  [/\bwire\b/g, 'fil de fer'],
  [/\bWire\b/g, 'Fil de fer'],
  [/the wire/g, 'le fil de fer'],
  [/wire of the/g, 'fil de fer du'],
  [/length of yarn/g, 'longueur de fil'],
  [/yarn tail/g, 'fil'],
  [/yarn tails/g, 'fils'],
  [/the yarn tail/g, 'le fil'],
  [/tail end/g, 'extrémité de fil'],
  [/long tail/g, 'longue longueur'],
  [/medium tail/g, 'longueur moyenne'],
  [/short tail/g, 'courte longueur'],
  [/long yarn tail/g, 'longue longueur de fil'],
  [/short yarn tail/g, 'courte longueur de fil'],
  [/medium yarn tail/g, 'longueur de fil moyenne'],
  [/with a slst/g, 'avec 1 maille coulée'],
  [/Make a slip stitch using/g, 'Faites une maille coulée en utilisant'],
  [/ending at the next corner/g, 'en terminant au coin suivant'],

  // misc recurring
  [/in the same fashion as/g, 'de la même façon que'],
  [/Worked in the same fashion as/g, 'Travaillé de la même façon que'],
  [/in the same way as the first/g, 'de la même façon que le premier'],
  [/in the same manner as before/g, 'de la même manière que précédemment'],
  [/the same process as in Step/g, 'la même méthode qu\u2019à l\u2019Étape'],
  [/the same process in Step/g, 'la même méthode qu\u2019à l\u2019Étape'],
  [/following the same process as in Step/g, 'en suivant la même méthode qu\u2019à l\u2019Étape'],
  [/using the same process as in Step/g, 'en utilisant la même méthode qu\u2019à l\u2019Étape'],
  [/using the same process in Step/g, 'en utilisant la même méthode qu\u2019à l\u2019Étape'],
  [/repeat across/gi, 'répétez sur tout le rang'],
  [/all in blo—/g, 'le tout dans le brin arrière — '],
  [/in continuous rounds/g, 'en spirale (tours continus)'],
  [/continuous rounds/g, 'tours continus'],
  [/Now you will work in rows\./g, 'Vous allez maintenant travailler en rangs aller-retour.'],
  [/Now you will work in rounds\./g, 'Vous allez maintenant travailler en rond.'],
  [/work in rows/g, 'travaillez en rangs aller-retour'],
  [/work in rounds/g, 'travaillez en rond'],
  [/Continue working in a spiral\./g, 'Continuez de travailler en spirale.'],
  [/in a spiral/g, 'en spirale'],
  [/to close up/g, 'pour fermer'],
  [/stitch count/g, 'nombre de mailles'],
  [/stitch spaces/g, 'espaces de mailles'],
  [/stitch space/g, 'espace de maille'],
  [/stitches apart/g, 'mailles d\u2019écart'],
  [/spaces apart/g, 'espaces d\u2019écart'],
  [/stitch of the round/g, 'maille du tour'],
  [/stitch of the row/g, 'maille du rang'],
  [/first st of the round/g, 'première maille du tour'],
  [/at the start of the row/g, 'au début du rang'],
  [/at the start of the round/g, 'au début du tour'],
  [/at the end of the row/g, 'à la fin du rang'],
  [/at the end of Row/g, 'à la fin du Rang'],
  [/at the end of Rnd/g, 'à la fin du Tour'],
  [/at the end of the round/g, 'à la fin du tour'],
  [/at the end of this row/g, 'à la fin de ce rang'],
  [/at the end of the strip/g, 'à la fin de la bande'],
  [/at the end of each round/g, 'à la fin de chaque tour'],
  [/at the end of/g, 'à la fin de'],
  [/end of Rnd/g, 'fin du Tour'],
  [/end of the row/g, 'fin du rang'],
  [/end of Row/g, 'fin du Rang'],
  [/in the last round/g, 'au dernier tour'],
  [/in the last row/g, 'au dernier rang'],
  [/the current round/g, 'le tour en cours'],
  [/the previous round/g, 'le tour précédent'],
  [/the previous row/g, 'le rang précédent'],
  [/previous row's/g, 'du rang précédent'],
  [/the row below the current row/g, 'le rang situé sous le rang en cours'],
  [/the indicated stitch/g, 'la maille indiquée'],
  [/indicated stitch/g, 'maille indiquée'],
  [/the indicated dc/g, 'les brides indiquées'],
  [/where your decrease just ended/g, 'où votre diminution vient de se terminer'],
  [/Make a standard decrease\./g, 'Faites une diminution classique.'],
  [/make another decrease/g, 'faites une autre diminution'],
  [/This results in 2 stitches \(2dec\) where there were 3sc\./g, 'On obtient ainsi 2 mailles (2dim) là où il y avait 3 mailles serrées.'],
  [/to finish\./g, 'pour terminer.'],
  [/to finish,/g, 'pour terminer,'],
  [/twice\./g, 'deux fois.'],
  [/four total\./g, 'quatre au total.'],
  [/evenly down the side/g, 'réparties le long du côté'],
  [/evenly up the side/g, 'réparties le long du côté'],
  [/evenly down/g, 'réparties le long de'],
  [/evenly up/g, 'réparties le long de'],
  [/evenly around/g, 'réparties tout autour'],
  [/evenly across/g, 'réparties sur'],
  [/sc evenly around/g, 'des mailles serrées réparties tout autour'],
  [/begin working sc evenly around/g, 'commencez des mailles serrées réparties tout autour'],
  [/working 1sc into the side of each row/g, 'en travaillant 1 maille serrée dans le côté de chaque rang'],
  [/working 5sc through each ring/g, 'en travaillant 5 mailles serrées à travers chaque anneau'],
  [/working through both loops/g, 'en travaillant dans les deux brins'],
  [/working through both pieces/g, 'en travaillant à travers les deux pièces'],
  [/working through both sides/g, 'en travaillant à travers les deux côtés'],
  [/working through the back loops only/g, 'en travaillant dans les brins arrière uniquement'],
  [/working in front of previous stitches/g, 'en travaillant devant les mailles précédentes'],
  [/working down the chain/g, 'en redescendant le long de la chaînette'],
  [/back down the chain/g, 'en redescendant le long de la chaînette'],
  [/working on the backside of the ch/g, 'en travaillant sur l\u2019envers de la chaînette'],
  [/working around the end of the chain/g, 'en tournant autour du bout de la chaînette'],
  [/working down the unworked side of the starting chain/g, 'en redescendant le long du côté non travaillé de la chaînette de départ'],
  [/working down the unused \(back\) side of the chain/g, 'en redescendant le long du côté non utilisé (arrière) de la chaînette'],
  [/working down the sloped edge/g, 'en redescendant le long du bord en pente'],
  [/down the sloped edge/g, 'le long du bord en pente'],
  [/the sloped edge/g, 'le bord en pente'],
  [/working back and forth/g, 'en travaillant en allers-retours'],
  [/work back and forth/g, 'travaillez en allers-retours'],
  [/skipping over/g, 'en sautant'],
  [/skipped stitches/g, 'mailles sautées'],
  [/skipped stitches/g, 'mailles sautées'],
  [/left unworked/g, 'non travaillées'],
  [/1 semicircle/g, '1 demi-cercle'],
  [/2 semicircles/g, '2 demi-cercles'],
  [/small amounts\b/g, 'petites quantités'],
  [/small amount\b/g, 'petite quantité'],
  [/about 4 skeins or 1520 yds/g, 'environ 4 pelotes ou 1520 yd'],
  [/, 1 skein\b/g, ', 1 pelote'],
  [/, 2 skeins\b/g, ', 2 pelotes'],
  [/, 4 skeins\b/g, ', 4 pelotes'],
  [/ per 7 oz\. \/ 198 g skein/g, ' par pelote de 7 oz / 198 g'],

  // ring references
  [/into ring\b/g, 'dans l\u2019anneau'],
  [/in the ring\b/g, 'dans l\u2019anneau'],
  [/in ring\b/g, 'dans l\u2019anneau'],

  // starting / segment prefixes (unanchored; tags are carved out before this runs)
  [/Starting in the /g, 'En commençant dans la '],
  [/starting in the /g, 'en commençant dans la '],
  [/Starting in 2/g, 'En commençant dans la 2'],
  [/starting in 2/g, 'en commençant dans la 2'],
  [/Starting in la /g, 'En commençant dans la '],
  [/starting in la /g, 'en commençant dans la '],
  [/Starting /g, 'En commençant '],
  [/starting /g, 'en commençant '],
  [/Change to /g, 'Passez à '],
  [/change to /g, 'changez pour '],
  [/Continue in /g, 'Continuez avec '],
  [/With /g, 'Avec '],
  [/Pick up again with /g, 'Reprenez avec '],
  [/ up again, /g, ', '],
  [/Fasten off and /g, 'Arrêtez le fil et '],
  [/fasten off and /g, 'arrêtez le fil et '],
  [/fasten onto the next st in blo/g, 'raccordez le fil à la maille suivante dans le brin arrière'],
  [/In next st through both loops, \(ch1, dc5tog, ch1\) to create a bobble/g, 'Dans la maille suivante, à travers les deux brins, (1 maille chaînette, 5 brides fermées ensemble, 1 maille chaînette) pour former une noisette'],
  [/in top of bobble/g, 'dans le haut de la noisette'],
  [/ in $/g, ' en '],
  [/^ total\)$/g, ' au total)'],
  [/ in total\)/g, ' au total)'],
  [/before the beginning of Subrow/g, 'avant le début du Sous-rang'],

  // final catch-alls (keep at end)
  [/\bspaces\b/g, 'espaces'],
  [/\bspace\b/g, 'espace'],
  [/\brounds\b/g, 'tours'],
  [/\bround\b/g, 'tour'],
  [/\brows\b/g, 'rangs'],
  [/\brow\b/g, 'rang'],
  [/\bstitches\b/g, 'mailles'],
  [/\bstitch\b/g, 'maille'],
  [/\bsts\b/g, 'mailles'],
  [/\bst\b/g, 'maille'],
  [/\bloops\b/g, 'boucles'],
  [/\bloop\b/g, 'boucle'],
  [/\bturn\b/g, 'tournez'],
  [/\bturns\b/g, 'tours'],
  [/\bstuffing\b/g, 'rembourrage'],
  [/\bsewn\b/g, 'cousu'],
  [/\bsewing\b/g, 'couture'],
  [/\bsew\b/g, 'cousez'],
  [/\bpins\b/g, 'épingles'],
  [/\bpinning\b/g, 'épinglage'],
  [/\bpin\b/g, 'épinglez'],
  [/\bweave in\b/g, 'rentrez'],
  [/\bfasten off\b/gi, 'arrêtez le fil'],
  [/\bbobble\b/g, 'noisette'],
  [/\bbobbles\b/g, 'noisettes'],
  [/\band\b/g, 'et'],
  [/\byarn\b/g, 'fil'],
  [/\bhook\b/g, 'crochet'],
  [/\bcorners\b/g, 'coins'],
  [/\bcorner\b/g, 'coin'],
  [/\bacross\b/g, 'sur tout le rang'],
  [/\baround\b/g, 'tout autour'],
];

// ------------------------------------------------------------------ tag handling
const FORMATTING_TAGS = new Set(['b', 'bold', 'i', 'italic', 'italicfine', 'sup', 'sub', 'note', 'style', 'footnote', 'link']);
const SOURCE_LIKE = /^(?:[A-Z][A-Za-z0-9]{0,3}|XGE|XDMG|XPHB|SCC|FTD|VEoR|BGDIA|TCE|PHB|DMG|BAM|MaBJoV|Greyhawk)$/;

function splitTopLevel(s, sep) {
  const parts = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (ch === sep && depth === 0) { parts.push(cur); cur = ''; } else { cur += ch; }
  }
  parts.push(cur);
  return parts;
}

function findTag(s) {
  const start = s.indexOf('{@');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') { depth--; if (depth === 0) return [start, i + 1]; }
  }
  return null;
}

let leftoverUnchanged = [];
let leftoverEnglish = [];

function inner(s) {
  let out = s;
  for (const [re, repl] of P) out = out.replace(re, repl);
  out = applyTokens(out);
  out = applyColors(out);
  // units: inches -> po, decimal point -> decimal comma before metric units
  out = out.replace(/([\d½¾¼]) in\./g, '$1 po');
  out = out.replace(/(\d)\.(\d+) (cm|mm|m|po|oz|yd|lbs?)\b/g, '$1,$2 $3');
  out = out.replace(/(\d+) yd\./g, '$1 yd');
  out = out.replace(/(\d+) feet\b/g, '$1 pi');
  out = out.replace(/  +/g, ' ');
  out = out.replace(/ ,/g, ',');
  return out;
}

function translateTag(tag) {
  const m = tag.match(/^\{@([a-zA-Z]+) ([\s\S]*)\}$/);
  if (!m) return tag;
  const name = m[1];
  const content = m[2];
  if (name === 'footnote') {
    const parts = splitTopLevel(content, '|');
    if (parts.length >= 2) {
      const disp = parts.slice(1).join('|');
      return '{@footnote ' + parts[0] + '|' + full(disp) + '}';
    }
    return '{@footnote ' + full(content) + '}';
  }
  if (FORMATTING_TAGS.has(name)) {
    return '{@' + name + ' ' + full(content) + '}';
  }
  // reference tags: keep identifiers, translate trailing display
  const parts = splitTopLevel(content, '|');
  if (parts.length === 1) return tag;
  const disp = parts[parts.length - 1];
  if (disp === '' || SOURCE_LIKE.test(disp.trim())) return tag;
  parts[parts.length - 1] = full(disp);
  return '{@' + name + ' ' + parts.join('|') + '}';
}

function full(s) {
  const exact = DICT[s];
  if (exact !== undefined && exact !== null) return exact;
  let out = '';
  let rest = s;
  for (;;) {
    const hit = findTag(rest);
    if (!hit) break;
    const [a, b] = hit;
    out += inner(rest.slice(0, a));
    out += translateTag(rest.slice(a, b));
    rest = rest.slice(b);
  }
  out += inner(rest);
  const strippedIn = s.replace(/\{@[^{}]*\}/g, ' ').replace(/[\d\s(),.:;×–\-/x"'!?#*%&+«»]+/g, '');
  if (out === s) {
    if (strippedIn.length > 3 && /[a-z]/.test(strippedIn)) leftoverUnchanged.push(s);
  } else {
    const strippedOut = out.replace(/\{@[^{}]*\}/g, ' ');
    if (/\b(the|and|with|from|your|you|each|next|make|place|repeat|attach|insert|fold|skip|change|join|close|continue|work|working|into|evenly|leaving|leave|ring|same|first|last|end|new|both|until|while|when|where|this|that|these|those|will|should|can|may|need|before|after|between|through|toward|against|just|only|again|more|then|them|they|its|it's)\b/i.test(strippedOut)) {
      leftoverEnglish.push(s);
    }
  }
  return out;
}

// ------------------------------------------------------------------ walkers
function mapStrings(v) {
  if (typeof v === 'string') return full(v);
  if (Array.isArray(v)) return v.map(mapStrings);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      if (k === 'name') out[k] = DICT[val] !== undefined ? DICT[val] : full(val);
      else if (k === 'entries' || k === 'title') out[k] = mapStrings(val);
      else if (k === 'items') out[k] = mapStrings(val);
      else out[k] = val;
    }
    return out;
  }
  return v;
}

function mapSize(v) {
  if (Array.isArray(v)) return v.map(mapSize);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      if (k === 'entry') out[k] = full(val);
      else out[k] = val;
    }
    return out;
  }
  return v;
}

function mapImages(v) {
  if (Array.isArray(v)) return v.map(mapImages);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      if (k === 'title') out[k] = full(val);
      else out[k] = val;
    }
    return out;
  }
  return v;
}

function translatePatternFile(json) {
  return { crochetPattern: json.crochetPattern.map(p => {
    const np = {};
    for (const [k, val] of Object.entries(p)) {
      if (k === 'name') np[k] = DICT[val] !== undefined ? DICT[val] : full(val);
      else if (['yarn', 'notions', 'gauge', 'notes', 'finishing', 'sizeNote', 'instructions', 'stitches', 'abbreviations'].includes(k)) np[k] = mapStrings(val);
      else if (k === 'size') np[k] = mapSize(val);
      else np[k] = val;
    }
    return np;
  }) };
}

function translateFluffFile(json) {
  return { crochetPatternFluff: json.crochetPatternFluff.map(f => {
    const nf = {};
    for (const [k, val] of Object.entries(f)) {
      if (k === 'name') nf[k] = DICT[val] !== undefined ? DICT[val] : full(val);
      else if (k === 'entries') nf[k] = mapStrings(val);
      else if (k === 'images') nf[k] = mapImages(val);
      else nf[k] = val;
    }
    return nf;
  }) };
}

// ------------------------------------------------------------------ main
const dir = __dirname;
const apply = process.argv.includes('--apply');

const mainJson = JSON.parse(fs.readFileSync(path.join(dir, 'homecrafts.json'), 'utf8'));
const fluffJson = JSON.parse(fs.readFileSync(path.join(dir, 'fluff-homecrafts.json'), 'utf8'));

leftoverUnchanged = []; leftoverEnglish = [];
const mainOut = translatePatternFile(mainJson);
const mainUnchanged = [...new Set(leftoverUnchanged)];
const mainEnglish = [...new Set(leftoverEnglish)];
leftoverUnchanged = []; leftoverEnglish = [];
const fluffOut = translateFluffFile(fluffJson);
const fluffUnchanged = [...new Set(leftoverUnchanged)];
const fluffEnglish = [...new Set(leftoverEnglish)];

if (apply) {
  fs.writeFileSync(path.join(dir, 'homecrafts.json'), JSON.stringify(mainOut, null, '\t') + '\n', 'utf8');
  fs.writeFileSync(path.join(dir, 'fluff-homecrafts.json'), JSON.stringify(fluffOut, null, '\t') + '\n', 'utf8');
  console.log('WRITTEN.');
}

function report(title, list, cap) {
  console.log('=== ' + title + ' (' + list.length + ') ===');
  for (const s of list.slice(0, cap)) console.log('  IN : ' + JSON.stringify(s) + '\n  OUT: ' + JSON.stringify(full(s)));
}
report('MAIN unchanged', mainUnchanged, 400);
report('MAIN english-ish', mainEnglish, 400);
report('FLUFF unchanged', fluffUnchanged, 100);
report('FLUFF english-ish', fluffEnglish, 100);
