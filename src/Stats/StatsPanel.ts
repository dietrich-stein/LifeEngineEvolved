import PopulationChart from './Charts/PopulationChart';
import SpeciesChart from './Charts/SpeciesChart';
import MutationChart from './Charts/MutationChart';
import CellsChart from './Charts/CellsChart';
import Species from './Species';

const ChartSelections = [
  PopulationChart,
  SpeciesChart,
  CellsChart,
  MutationChart,
];

type ChartControllerType = 
  | PopulationChart
  | SpeciesChart
  | CellsChart
  | MutationChart
  | null;

class StatsPanel {
  env: WorldEnvironment;
  chart_controller: ChartControllerType;
  chart_selection: number;
  last_reset_count: number;
  render_loop: number;

  constructor(env: WorldEnvironment) {
    this.env = env;
    this.chart_controller = null;
    this.chart_selection = 0;
    this.last_reset_count = env.auto_reset_count;
    this.render_loop = 0;

    this.defineControls();
    this.setChart();
  }

  setChart(selection = this.chart_selection) {
    this.chart_controller = new ChartSelections[selection](
      this.env.fossil_record,
    );
    this.chart_controller.setData();
    this.chart_controller.render();
  }

  startAutoRender() {
    this.setChart();
    let self = this;
    this.render_loop = setInterval(() => {
      self.updateChart();
    }, 1000);
  }

  stopAutoRender() {
    clearInterval(this.render_loop);
  }

  defineControls() {
    let self = this;
    $('#chart-option').change((event: JQuery.ChangeEvent) => {
      self.chart_selection = event.target.selectedIndex;
      self.setChart();
    });
  }

  updateChart() {
    if (this.last_reset_count < this.env.auto_reset_count) {
      this.reset();
    }
    this.last_reset_count = this.env.auto_reset_count;
    if (this.chart_controller !== null) {
      this.chart_controller.updateData();
      this.chart_controller.render();
    }
  }

  updateDetails() {
    var org_count = this.env.organisms.length;
    $('#org-count').text('Total Population: ' + org_count);

    let top5_by_population: Array<Species> = Object.values(
      this.env.fossil_record.extant_species,
    );

    top5_by_population
      .sort((f, s) => {
        return s.population - f.population;
      })
      .slice(0, 5)
      .reduce((c, v) => ({ ...c, [v.name]: v.population }), {});

    $('#top-species-population').text(
      'Top 5 Species By Population: ' +
        JSON.stringify(top5_by_population)
          .replace(/[{}]/g, '')
          .replace(/[,]/g, '\n'),
    );
    $('#species-count').text(
      'Number of Species: ' + this.env.fossil_record.numExtantSpecies(),
    );
    $('#largest-org').text(
      'Largest Organism Ever: ' + this.env.largest_cell_count + ' cells',
    );
    $('#avg-mut').text(
      'Average Mutation Rate: ' +
        Math.round(this.env.averageMutability() * 100) / 100,
    );
  }

  reset() {
    this.setChart();
  }
}

export default StatsPanel;
