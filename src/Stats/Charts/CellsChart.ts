import CellStates from '../../Anatomy/CellStates';
import FossilRecord from '../FossilRecord';
import ChartController from './ChartController';

class CellsChart extends ChartController {
  constructor(fossil_record: FossilRecord) {
    super(
      fossil_record,
      'Organism Size / Composition',
      'Avg. Number of Cells per Organism',
      'Note: to maintain efficiency, species with very small populations are discarded when collecting cell statistics.',
    );
  }

  setData() {
    this.clear();
    this.data.push({
      type: 'line',
      markerType: 'none',
      color: 'black',
      showInLegend: true,
      name: 'pop1',
      legendText: 'Avg. organism size',
      dataPoints: [],
    });
    for (var c of CellStates.living) {
      this.data.push({
        type: 'line',
        markerType: 'none',
        color: c.color,
        showInLegend: true,
        name: c.name,
        legendText: 'Avg. ' + c.name + ' cells',
        dataPoints: [],
      });
    }
    this.addAllDataPoints();
  }

  addDataPoint(i: number) {
    var t = this.fossil_record.tick_record[i];
    var p = this.fossil_record.av_cells[i];
    this.data[0].dataPoints.push({ x: t, y: p });
    var j = 1;
    let av_cell_counts = this.fossil_record.av_cell_counts;// as AverageCellCountsType;
    for (var cellName in av_cell_counts[i]) {
      var count = av_cell_counts[i][cellName as keyof CellCountsType];
      this.data[j].dataPoints.push({
        x: t, 
        y: count 
      });
      j++;
    }
  }
}

export default CellsChart;
