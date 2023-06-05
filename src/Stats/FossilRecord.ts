import WorldEnvironment from '../Environment/WorldEnvironment';
import CellStates from '../Anatomy/CellStates';
import SerializeHelper from '../Utils/SerializeHelper';
import Species from './Species';
import Organism from '../Organism/Organism';

interface CountArrayInterface {
  [key: string]: number;
} 

interface ExtantSpeciesInterface {
  [key: string]: Species;
}

interface ExtinctSpeciesInterface {
  [key: string]: Species;
}

interface FossilRecordInterface {
  env: WorldEnvironment;
  extant_species: ExtantSpeciesInterface;
  extinct_species: ExtinctSpeciesInterface;
  min_discard: number;
  record_size_limit: number;
  tick_record: Array<number>;
  pop_counts: Array<number>;
  species_counts: Array<number>;
  av_mut_rates: Array<number>;
  av_cells: Array<number>;
  av_cell_counts: AverageCellCountsType;  
  addSpecies: (org: Organism, ancestor: Species) => Species;
  addSpeciesObj: (species: Species) => void;
  decreasePopulation: (species: Species) => void;
  numExtantSpecies: () => number;
  numExtinctSpecies: () => number;
  speciesIsExtant: (species_name: string) => boolean;
  fossilize: (species: Species) => boolean;
  resurrect: (species: Species) => void;
  updateData: () => void;
  calcCellCountAverages: () => void;
  clear_record: () => void;
  serialize: () => any;
  loadRaw: (record: any) => void;
}

class FossilRecord implements FossilRecordInterface {
  env: WorldEnvironment;
  extant_species: ExtantSpeciesInterface;
  extinct_species: ExtinctSpeciesInterface;
  min_discard: number;
  record_size_limit: number;
  tick_record: Array<number>;
  pop_counts: Array<number>;
  species_counts: Array<number>;
  av_mut_rates: Array<number>;
  av_cells: Array<number>;
  av_cell_counts: AverageCellCountsType;

  constructor(env: WorldEnvironment) {
    this.env = env;
    this.min_discard = 10; // if org cumulative pop is fewer on extinction
    this.record_size_limit = 500; // store this many data points

    // Tracked data
    this.extant_species = {};
    this.extinct_species = {};
    this.tick_record = [];
    this.pop_counts = [];
    this.species_counts = [];
    this.av_mut_rates = [];
    this.av_cells = [];
    this.av_cell_counts = [];
  }

  addSpecies(org: Organism, ancestor: Species | null) {
    var new_species = new Species(org.anatomy, ancestor, this.env.total_ticks);
    this.extant_species[new_species.name] = new_species;
    org.species = new_species;
    return new_species;
  }

  addSpeciesObj(species: Species) {
    if (this.extant_species[species.name]) {
      console.warn('Tried to add already existing species. Add failed.');
      return;
    }
    this.extant_species[species.name] = species;
  }

  decreasePopulation(species: Species) {
    species.population--;

    if (species.population <= 0) {
      species.extinct = true;
      this.fossilize(species);
    }
  }

  numExtantSpecies() {
    return Object.values(this.extant_species).length;
  }

  numExtinctSpecies() {
    return Object.values(this.extinct_species).length;
  }

  speciesIsExtant(species_name: string) {
    return !!this.extant_species[species_name];
  }

  fossilize(species: Species) {
    if (!this.extant_species[species.name]) {
      console.warn('Tried to fossilize non existing species.');
      return false;
    }
    species.end_tick = this.env.total_ticks;
    species.ancestor = null; // garbage collect ancestors
    delete this.extant_species[species.name];
    if (species.cumulative_pop >= this.min_discard) {
      // TODO: store as extinct species
      return true;
    }
    return false;
  }

  resurrect(species: Species) {
    if (species.extinct) {
      species.extinct = false;
      this.extant_species[species.name] = species;
      delete this.extinct_species[species.name];
    }
  }

  updateData() {
    var tick = this.env.total_ticks;
    this.tick_record.push(tick);
    this.pop_counts.push(this.env.organisms.length);
    this.species_counts.push(this.numExtantSpecies());
    this.av_mut_rates.push(this.env.averageMutability());
    this.calcCellCountAverages();
    while (this.tick_record.length > this.record_size_limit) {
      this.tick_record.shift();
      this.pop_counts.shift();
      this.species_counts.shift();
      this.av_mut_rates.shift();
      this.av_cells.shift();
      this.av_cell_counts.shift();
    }
  }

  calcCellCountAverages() {
    var total_org = 0;
    var cell_counts: CountArrayInterface = {};
    var living = CellStates.getLiving();
    for (let c of living) {
      cell_counts[c.name] = 0;
    }
    var first = true;
    for (let s of Object.values(this.extant_species)) {
      if (
        !first &&
        this.numExtantSpecies() > 10 &&
        s.cumulative_pop < this.min_discard
      ) {
        continue;
      }
      for (let name in s.cell_counts) {
        let s_count = s.cell_counts[name];
        cell_counts[name] += s_count * s.population;
      }
      total_org += s.population;
      first = false;
    }
    if (total_org == 0) {
      this.av_cells.push(0);
      // @todo: figure out what happened here and fix it
      //this.av_cell_counts.push(cell_counts);
      return;
    }

    var total_cells = 0;
    for (let c in cell_counts) {
      total_cells += cell_counts[c];
      cell_counts[c] /= total_org;
    }
    this.av_cells.push(total_cells / total_org);
    // @todo: figure out what happened here and fix it
    //this.av_cell_counts.push(cell_counts);
  }

  clear_record() {
    this.extant_species = {};
    this.extinct_species = {};
    this.tick_record = [];
    this.pop_counts = [];
    this.species_counts = [];
    this.av_mut_rates = [];
    this.av_cells = [];
    this.av_cell_counts = [];
  }

  serialize() {
    this.updateData();
    let record = SerializeHelper.copyNonObjects(this);
    /*
    @todo: Fix me
    record.records = {
      tick_record: this.tick_record,
      pop_counts: this.pop_counts,
      species_counts: this.species_counts,
      av_mut_rates: this.av_mut_rates,
      av_cells: this.av_cells,
      av_cell_counts: this.av_cell_counts,
    };
    let species = {};
    for (let s of Object.values(this.extant_species)) {
      species[s.name] = SerializeHelper.copyNonObjects(s);
      delete species[s.name].name; // the name will be used as the key, so remove it from the value
    }
    record.species = species;
    */
    return record;
  }

  // @todo: sigh, le json... fix me
  loadRaw(record: any) {
    SerializeHelper.overwriteNonObjects(record, this);
    for (let key in record.records) {
      //this[key] = record.records[key];
    }
  }
}

export default FossilRecord;
