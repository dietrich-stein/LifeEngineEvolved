import PopulationChart from './Charts/PopulationChart';
import SpeciesChart from './Charts/SpeciesChart';
import MutationChart from './Charts/MutationChart';
import CellsChart from './Charts/CellsChart';

const ChartSelections = [
  PopulationChart,
  SpeciesChart,
  CellsChart,
  MutationChart,
];

class StatsPanel {
  constructor(env) {
    this.defineControls();
    this.chart_selection = 0;
    this.env = env;
    this.last_reset_count = env.reset_count;
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
    this.render_loop = setInterval(
      function () {
        this.updateChart();
      }.bind(this),
      1000,
    );
  }

  stopAutoRender() {
    clearInterval(this.render_loop);
  }

  defineControls() {
    $('#chart-option').change(
      function () {
        this.chart_selection = $('#chart-option')[0].selectedIndex;
        this.setChart();
      }.bind(this),
    );
  }

  updateChart() {
    if (this.last_reset_count < this.env.reset_count) {
      this.reset();
    }
    this.last_reset_count = this.env.reset_count;
    this.chart_controller.updateData();
    this.chart_controller.render();
  }

  updateDetails() {
    var org_count = this.env.organisms.length;
    $('#org-count').text('Total Population: ' + org_count);

    let top5_by_population = Object.values(
      this.env.fossil_record.extant_species,
    );
    top5_by_population = top5_by_population
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
