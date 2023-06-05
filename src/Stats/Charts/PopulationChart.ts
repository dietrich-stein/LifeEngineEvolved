import FossilRecord from '../FossilRecord';
import ChartController from './ChartController';

class PopulationChart extends ChartController {
  constructor(fossil_record: FossilRecord) {
    super(fossil_record, 'Population');
  }

  setData() {
    this.clear();
    this.data.push({
      type: 'line',
      markerType: 'none',
      color: 'black',
      showInLegend: true,
      name: 'pop1',
      legendText: 'Total Population',
      dataPoints: [],
    });
    this.addAllDataPoints();
  }

  addDataPoint(i: number) {
    var t = this.fossil_record.tick_record[i];
    var p = this.fossil_record.pop_counts[i];
    this.data[0].dataPoints.push({ x: t, y: p });
  }
}

export default PopulationChart;
