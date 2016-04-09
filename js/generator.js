﻿/* License: MIT License */
const STATS = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"];
const GENS = ["rby", "gsc", "adv", "dpp", "bw", "xy"];
const METAS = ["uber", "ou", "uu", "ru", "nu", "pu", "lc"];
const FORMES = {
    "Arceus": ["Arceus", "Arceus-Bug", "Arceus-Dark", "Arceus-Dragon",
            "Arceus-Electric", "Arceus-Fairy", "Arceus-Fighting", "Arceus-Fire",
            "Arceus-Flying", "Arceus-Ghost", "Arceus-Grass", "Arceus-Ground",
            "Arceus-Ice", "Arceus-Poison", "Arceus-Psychic", "Arceus-Rock",
            "Arceus-Steel", "Arceus-Water"],
    "Deoxys": ["Deoxys", "Deoxys-Attack", "Deoxys-Defense", "Deoxys-Speed"],
    "Giratina": ["Giratina", "Giratina-Origin"],
    "Gourgeist": ["Gourgeist", "Gourgeist-Large", "Gourgeist-Small", "Gourgeist-Super"],
    "Hoopa": ["Hoopa", "Hoopa-Unbound"],
    "Kyurem": ["Kyurem", "Kyurem-Black", "Kyurem-White"],
    "Landorus": ["Landorus", "Landorus-Therian"],
    "Pumpkaboo": ["Pumpkaboo", "Pumpkaboo-Large", "Pumpkaboo-Small", "Pumpkaboo-Super"],
    "Rotom": ["Rotom", "Rotom-Fan", "Rotom-Frost", "Rotom-Heat", "Rotom-Mow", "Rotom-Wash"],
    "Shaymin": ["Shaymin", "Shaymin-Sky"],
    "Thundurus": ["Thundurus", "Thundurus-Therian"],
    "Tornadus": ["Tornadus", "Tornadus-Therian"],
    "Wormadam": ["Wormadam", "Wormadam-Sandy", "Wormadam-Trash"],
};
var setdex = {
    rby: {},
    gsc: {},
    adv: {},
    dpp: {},
    bw: {},
    xy: {},
};

var teamGenerator = angular.module('teamGenerator', ['ui.bootstrap']);
teamGenerator.controller('GeneratorController', function($scope) {

    $scope.validMeta = function(meta) {
        return !!setdex[$scope.gen][meta];
    };

    $scope.availablePokemon = function() {
        return Object.keys(setdex[$scope.gen][$scope.meta]);
    };

    var _generateTeam = function(oldTeam) {
        var pokemonNames = [];
        // loop through once to get all locked pokemon names before we generate new ones
        for (var i = 0; i < 6; i++) {
            if (oldTeam[i] && (oldTeam[i].locked || oldTeam[i].speciesLocked)) {
                pokemonNames[i] = oldTeam[i].name;
            }
        }
        // loop through again to add new pokemon, excluding ALL locked
        var newTeam = [];
        for (i = 0; i < 6; i++) {
            if (oldTeam[i] && oldTeam[i].locked) {
                console.log("Old set for " + oldTeam[i].name);
                newTeam[i] = oldTeam[i];
            } else {
                if (!pokemonNames[i]) {
                    pokemonNames[i] = getRandomElement($scope.availablePokemon(), expandSpeciesFormes(pokemonNames));
                    console.log("New Pokemon: " + pokemonNames[i]);
                }
                console.log("New set for " + pokemonNames[i]);
                newTeam[i] = pickSet(pokemonNames[i], setdex[$scope.gen][$scope.meta][pokemonNames[i]]);
                newTeam[i].speciesLocked = oldTeam[i] && oldTeam[i].speciesLocked;
            }
        }
        $scope.team = newTeam;
    };

    $scope.generateTeam = function() {
        _generateTeam($scope.team);
    };

    $scope.generateNewTeam = function() {
        if (!$scope.validMeta($scope.meta)) {
            $scope.meta = "ou";
        }
        _generateTeam([]);
    };

    $scope.exportTeam = function() {
        var exportText = "";
        for (var i = 0; i < 6; i++) {
            exportText += exportSet($scope.team[i], $scope.meta);
        }
        $scope.teamExportReadOnly = false;
        $scope.teamExport = exportText.trim();
        $scope.teamExportReadOnly = true;
    };

    $scope.gen = "xy";
    $scope.meta = "ou";
    $scope.generateNewTeam();

    $scope.teamExport = "";
    $scope.teamExportReadOnly = true;
    $scope.teamExportLength = 1;
});

var expandSpeciesFormes = function(pokemonNames) {
    var formes = [];
    for (var i = 0; i < pokemonNames.length; i++) {
        if (pokemonNames[i]) {
            var hasFormes = false;
            for (var species in FORMES) {
                if (FORMES.hasOwnProperty(species) && pokemonNames[i].startsWith(species)) {
                    hasFormes = true;
                    formes = formes.concat(FORMES[species]);
                    break;
                }
            }
            if (!hasFormes) {
                formes.push(pokemonNames[i]);
            }
        }
    }
    return formes;
};

var getRandomElement = function(obj, exclusions) {
    var keys = Array.isArray(obj) ? obj : Object.keys(obj);
    var filteredKeys = !exclusions ? keys : keys.filter(function(element) {
        return exclusions.indexOf(element) === -1;
    });
    return filteredKeys.length > 0 ? filteredKeys[Math.floor(Math.random() * filteredKeys.length)] : "";
};

var pickSet = function(pokemon, sets) {
    var set = getRandomElement(sets);
    var moves = [];
    for (var i = 0; i < 4 && i < set.moves.length; i++) {
        moves.push(getRandomElement(set.moves[i], moves));
    }
    return {
        name: pokemon,
        item: getRandomElement(set.item),
        ability: getRandomElement(set.ability),
        nature: getRandomElement(set.nature),
        evs: set.evs,
        ivs: set.ivs,
        moves: moves,
    };
};

var exportSet = function(set, meta) {
    var exportText = set.name;
    if (set.item) {
        exportText += " @ " + set.item;
    }
    exportText += "\n";
    if (meta === "lc") {
        exportText += "Level: 5\n";
    }
    if (set.ability) {
        exportText += "Ability: " + set.ability + "\n";
    }
    if (set.evs) {
        exportText += "EVs: " + exportStats(set.evs) + "\n";
    }
    if (set.nature) {
        exportText += set.nature + " Nature\n";
    }
    if (set.ivs) {
        exportText += "IVs: " + exportStats(set.ivs) + "\n";
    }
    for (var i = 0; i < 4 && i < set.moves.length; i++) {
        exportText += "- " + set.moves[i] + "\n";
    }
    return exportText + "\n";
};

var exportStats = function(evs) {
    var exportText = "";
    for (var i = 0; i < STATS.length; i++) {
        var stat = STATS[i];
        var statEVs = evs[stat.toLowerCase()];
        if (statEVs || statEVs === 0) {
            if (exportText) {
                exportText += " / ";
            }
            exportText += statEVs + " " + stat;
        }
    }
    return exportText;
};

// bad browser support
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}
