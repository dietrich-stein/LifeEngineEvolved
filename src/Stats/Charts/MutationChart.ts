import FossilRecord from '../FossilRecord';
import ChartController from './ChartController';

class MutationChart extends ChartController {
  constructor(fossil_record: FossilRecord) {
    super(fossil_record, 'Mutation Rate');
  }

  setData() {
    this.clear();
    this.data.push({
      type: 'line',
      markerType: 'none',
      color: 'black',
      showInLegend: true,
      name: 'pop1',
      legendText: 'Average Mutation Rate',
      dataPoints: [],
    });
    this.addAllDataPoints();
  }

  addDataPoint(i: number) {
    var t = this.fossil_record.tick_record[i];
    var p = this.fossil_record.av_mut_rates[i];
    this.data[0].dataPoints.push({ x: t, y: p });
  }
}

export default MutationChart;
