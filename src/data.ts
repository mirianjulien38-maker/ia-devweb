import { PredefinedTemplate } from "./types";

export const PREDEFINED_TEMPLATES: PredefinedTemplate[] = [
  {
    id: "portfolio",
    name: "Portfolio Matihanina",
    icon: "User",
    description: "Tetikasa ho an'ny mpamorona, mpaka sary na mpanakanto. Ahitana dark mode, tetikasa ary contact form.",
    prompt: "Landing page Portfolio moderne sy tsara tarehy ho an'ny Freelance Developer. Ahitana dark mode switcher miasa tsara mampiasa JavaScript, fizarana momba ny tena (About), ny tetikasa vita (Portfolio) azo sivanina (filterable projects portfolio), ny fahaizana (Skills) misy progress bars animate, ny tantaram-piasana (Experience timeline), ary form handefasana hafatra misy simulation validation sy popup success mampiasa modal kanto."
  },
  {
    id: "restaurant",
    name: "Trano Fihinanana (Restaurant)",
    icon: "Utensils",
    description: "Tranonkala ho an'ny hôtely na trano fisakafoanana. Ahitana menu misy sary sy famandrihana latabatra.",
    prompt: "Tranonkala tsara tarehy, mafana, ho an'ny Restaurant Modern antsoina hoe 'GastroArt'. Ahitana sary manaitra ny fahazotoan-komana (Unsplash), fizarana Menu misy sokajy (Sakafo, Tsindrin-tsakafo, Fisotroana) ary azo sivanina amin'ny alalan'ny click, fizarana momba ny Chef, form famandrihana latabatra (Reservation form) mampiasa JavaScript hamonjena ny daty sy ny isan'olona miaraka amin'ny fahombiazana mampiseho popup kanto, ary ny hevitry ny mpanjifa (Testimonials)."
  },
  {
    id: "agency",
    name: "Startup / Digital Agency",
    icon: "Briefcase",
    description: "Landing page ho an'ny orinasa, startup na agency manome serivisy teknolojia.",
    prompt: "Landing page madio, matihanina, sy maoderina ho an'ny Digital Agency antsoina hoe 'Nexus Tech'. Ahitana lohateny lehibe misy soratra mandeha (animated hero text), fizarana Serivisy miaraka amin'ny icons miloko, fizarana Pricing tables (Gidragidra na karazana tolotra isam-bolana) azo togle-na eo amin'ny Yearly sy Monthly, fizarana Statistiques (counters), fizarana FAQ miasa tsara (accordion dropdowns mampiasa JS), ary footer feno."
  },
  {
    id: "ecommerce",
    name: "E-Commerce / Boutique",
    icon: "ShoppingBag",
    description: "Boutique en ligne misy lisitry ny entana, sivana, sy haron-tsakafo azo fenoina (cart simulation).",
    prompt: "Boutique en ligne modernina sy tsara tarehy ho an'ny 'UrbanStyle' (fitafiana maoderina). Ahitana lohateny manaitra, sivana sokajy (lehilahy, vehivavy, kojakoja), lisitry ny entana misy sary kanto sy vidiny, ary ny bokotra 'Hividy' (Add to Cart). Mampiasà JavaScript hamoronana simulation haron-tsakafo (Shopping Cart drawer na modal) izay manisa ny entana rehetra ao anatiny mivantana rehefa tsindrina ny bokotra, mampiseho ny totaliny ary afaka fafana."
  },
  {
    id: "blog",
    name: "Bilaogy Modern",
    icon: "BookOpen",
    description: "Bilaogy ho an'ny tantara, vaovao, na fizarana fahalalana miaraka amin'ny sivana sy fikarohana.",
    prompt: "Tranonkala Bilaogy tsara rafitra sy kanto antsoina hoe 'Tetikasa AI'. Ahitana lohateny lehibe mampiseho ny lahatsoratra sangany indrindra (Featured Post), lisitry ny lahatsoratra hafa (Cards) misy sokajy, daty ary mpanoratra, fizarana fikarohana lahatsoratra mampiasa JavaScript mba hanivanana ny lahatsoratra aseho mivantana rehefa manoratra, fizarana famandrihana Newsletter misy validation, ary tabilao momba ny mpanoratra."
  }
];
