"use strict";

import {getData} from "/composant/fonction/page.js";
import {afficherLesInformations} from "/information/afficher.js";

afficherLesInformations(
    document.getElementById("listeInformations"),
    getData("lesInformations")
);
