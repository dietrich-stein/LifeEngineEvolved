import FossilRecord from '../FossilRecord';
import CanvasJS from '@canvasjs/charts';

type ChartDataPointType = {
  x: number;
  y: number;
}

type ChartDataPointsType = Array<ChartDataPointType>;

type ChartDataObjectType = {
  type?: string;
  markerType?: string;
  color?: string;
  showInLegend?: boolean;
  name?: string;
  legendText?: string;
  dataPoints: ChartDataPointsType;
}

type ChartData = Array<ChartDataObjectType>;

class ChartController {
  fossil_record: FossilRecord;
  data: ChartData;
  chart: any;

  constructor(fossil_record: FossilRecord, title: string, y_axis: string = '', note: string = '') {
    this.fossil_record = fossil_record;
    this.data = [];
    this.chart = new CanvasJS.Chart('chartContainer', {
      zoomEnabled: true,
      title: {
        text: title,
      },
      axisX: {
        title: 'Ticks',
        minimum: 0,
      },
      axisY: {
        title: y_axis,
        minimum: 0,
      },
      data: this.data,
    });
    this.chart.render();
    $('#chart-note').text(note);
  }

  setData() {
    alert('Must override updateData!');
  }

  setMinimum() {
    var min = 0;
    if (this.data.length > 0 && this.data[0].dataPoints.length > 0) {
      var obj = this.data[0] as ChartDataObjectType;
      var dataPoints = obj.dataPoints as ChartDataPointsType;
      min = dataPoints[0].x;
    }
    this.chart.options.axisX.minimum = min;
  }

  addAllDataPoints() {
    for (var i in this.fossil_record.tick_record) {
      this.addDataPoint(parseInt(i));
    }
  }

  render() {
    this.setMinimum();
    this.chart.render();
  }

  updateData() {
    let record_size = this.fossil_record.tick_record.length;
    let data_points = this.data[0].dataPoints;
    let newest_t = -1;
    if (data_points.length > 0) {
      newest_t = this.data[0].dataPoints[data_points.length - 1].x;
    }
    let to_add = 0;
    let cur_t = this.fossil_record.tick_record[record_size - 1];
    // first count up the number of new datapoints the chart is missing
    while (cur_t !== newest_t) {
      to_add++;
      cur_t = this.fossil_record.tick_record[record_size - to_add - 1];
    }
    // then add them in order
    this.addNewest(to_add);

    // remove oldest datapoints until the chart is the same size as the saved records
    while (data_points.length > this.fossil_record.tick_record.length) {
      this.removeOldest();
    }
  }

  addNewest(to_add: number) {
    for (let i = to_add; i > 0; i--) {
      let j = this.fossil_record.tick_record.length - i;
      this.addDataPoint(j);
    }
  }

  removeOldest() {
    for (var dps of this.data) {
      dps.dataPoints.shift();
    }
  }

  addDataPoint(i: number) {
    alert('Must override addDataPoint');
  }

  clear() {
    this.data.length = 0;
    this.chart.render();
  }
}

export default ChartController;
