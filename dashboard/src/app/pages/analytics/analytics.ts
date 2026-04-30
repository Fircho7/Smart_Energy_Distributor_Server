import {
  AfterViewInit,
  Component,
  DoCheck,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { MockDataService } from '../../services/mock-data.service';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend
);

@Component({
  standalone: true,
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class AnalyticsComponent implements AfterViewInit, DoCheck, OnDestroy {
  @ViewChild('consumptionChart') consumptionChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('compareChart') compareChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('totalCurrentChart') totalCurrentChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('motorChart') motorChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('temperatureChart') temperatureChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lampChart') lampChartRef!: ElementRef<HTMLCanvasElement>;

  private consumptionChart?: Chart;
  private compareChart?: Chart;
  private totalCurrentChart?: Chart;
  private motorChart?: Chart;
  private temperatureChart?: Chart;
  private lampChart?: Chart;

  private lastSeenVersion = -1;
  private chartsReady = false;

  constructor(public mockData: MockDataService) {}

  ngAfterViewInit(): void {
    this.createAllCharts();
    this.chartsReady = true;
    this.lastSeenVersion = this.mockData.dataVersion;
  }

  ngDoCheck(): void {
    if (!this.chartsReady) return;

    if (this.lastSeenVersion !== this.mockData.dataVersion) {
      this.lastSeenVersion = this.mockData.dataVersion;
      this.updateAllCharts();
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  get expectedUsage(): string {
    return this.mockData.expectedMonthlyUsageComputed;
  }

  get realUsage(): string {
    return this.mockData.realMonthlyUsage;
  }

  get efficiency(): string {
    return this.mockData.efficiencyPercent;
  }

  get savedCost(): string {
    return this.mockData.savedCost;
  }

  get lampNominalCurrent(): string {
    const lamp = this.mockData.loads.find(load => load.name === 'Lamp');
    return lamp ? this.mockData.formatCurrent(lamp.nominalCurrent) : '0.00 A';
  }

  private commonOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false
      },
      hover: {
        mode: 'index' as const,
        intersect: false
      },
      plugins: {
        legend: {
          labels: {
            color: '#cbd5e1'
          }
        },
        tooltip: {
          enabled: true
        }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.06)' }
        },
        y: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.06)' }
        }
      }
    };
  }

  private motorOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false
      },
      hover: {
        mode: 'index' as const,
        intersect: false
      },
      plugins: {
        legend: {
          labels: {
            color: '#cbd5e1'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.06)' }
        },
        y: {
          position: 'left' as const,
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.06)' },
          title: {
            display: true,
            text: 'Current (A)',
            color: '#94a3b8'
          }
        },
        y1: {
          position: 'right' as const,
          ticks: { color: '#94a3b8' },
          grid: { drawOnChartArea: false },
          title: {
            display: true,
            text: 'RPM',
            color: '#94a3b8'
          }
        }
      }
    };
  }

  private getLoadCurrent(name: string): number {
    const load = this.mockData.loads.find(item => item.name === name);
    if (!load) return 0;
    return parseFloat(load.current.replace('A', '').trim()) || 0;
  }

  private getLoadUsage(name: string): number {
    const load = this.mockData.loads.find(item => item.name === name);
    return load ? load.usage : 0;
  }

  private buildConsumptionSeries(): number[] {
    const base = this.mockData.realMonthlyUsageValue / 7;
    return [
      Number((base * 1.08).toFixed(2)),
      Number((base * 0.96).toFixed(2)),
      Number((base * 1.04).toFixed(2)),
      Number((base * 0.91).toFixed(2)),
      Number((base * 1.02).toFixed(2)),
      Number((base * 0.88).toFixed(2)),
      Number((base * 0.84).toFixed(2))
    ];
  }

  private buildTotalCurrentSeries(): number[] {
    const total = this.mockData.totalCurrentValue;
    return [
      Number((total * 0.72).toFixed(2)),
      Number((total * 0.86).toFixed(2)),
      Number((total * 0.80).toFixed(2)),
      Number((total * 1.00).toFixed(2)),
      Number((total * 0.92).toFixed(2)),
      Number((total * 1.08).toFixed(2)),
      Number((total * 0.97).toFixed(2))
    ];
  }

  private buildCompareRealSeries(): number[] {
    const lampUsage = this.getLoadUsage('Lamp');
    const motorUsage = this.getLoadUsage('Motor');
    const pumpUsage = this.getLoadUsage('Pump');
    const ceramicUsage = this.getLoadUsage('Ceramic Load');
    const totalReal = Math.round((lampUsage + motorUsage + pumpUsage + ceramicUsage) / 4);

    return [lampUsage, motorUsage, pumpUsage, ceramicUsage, totalReal];
  }

  private buildMotorCurrentSeries(): number[] {
    const motorCurrent = this.getLoadCurrent('Motor');
    return [
      Number((motorCurrent * 0.55).toFixed(2)),
      Number((motorCurrent * 0.66).toFixed(2)),
      Number((motorCurrent * 0.78).toFixed(2)),
      Number((motorCurrent * 1.00).toFixed(2)),
      Number((motorCurrent * 0.91).toFixed(2)),
      Number((motorCurrent * 1.08).toFixed(2)),
      Number((motorCurrent * 0.97).toFixed(2))
    ];
  }

  private buildRpmSeries(): number[] {
    const motorUsage = this.getLoadUsage('Motor');
    const rpmBase = Math.round((motorUsage / 100) * 170);

    return [
      Math.round(rpmBase * 0.60),
      Math.round(rpmBase * 0.70),
      Math.round(rpmBase * 0.82),
      rpmBase,
      Math.round(rpmBase * 0.93),
      Math.round(rpmBase * 1.04),
      Math.round(rpmBase * 0.98)
    ];
  }

  private buildTemperatureSeries(): number[] {
    const ceramic = this.mockData.loads.find(load => load.name === 'Ceramic Load');
    const temp = ceramic ? ceramic.controlValue : 25;

    return [
      Math.max(20, temp - 8),
      Math.max(20, temp - 5),
      Math.max(20, temp - 3),
      temp,
      Math.max(20, temp - 1),
      Math.max(20, temp - 2),
      Math.max(20, temp - 4)
    ];
  }

  private buildLampSeries(): number[] {
    const lamp = this.mockData.loads.find(load => load.name === 'Lamp');
    const maxCurrent = lamp ? lamp.nominalCurrent : 1.75;
    const current = lamp ? parseFloat(lamp.current.replace('A', '').trim()) || 0 : 0;

    return [
      0.0,
      Number((maxCurrent * 0.25).toFixed(2)),
      Number((maxCurrent * 0.5).toFixed(2)),
      Number((maxCurrent * 0.75).toFixed(2)),
      Number(current.toFixed(2))
    ];
  }

  private createAllCharts(): void {
    this.consumptionChart = new Chart(this.consumptionChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Real Consumption (kWh)',
            data: this.buildConsumptionSeries(),
            borderColor: '#67e8f9',
            backgroundColor: 'rgba(103,232,249,0.18)',
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#67e8f9',
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: this.commonOptions()
    });

    this.compareChart = new Chart(this.compareChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Lamp', 'Motor', 'Pump', 'Ceramic', 'Total'],
        datasets: [
          {
            label: 'Expected',
            data: [100, 100, 100, 100, 100],
            backgroundColor: 'rgba(148,163,184,0.55)',
            borderRadius: 8
          },
          {
            label: 'Real',
            data: this.buildCompareRealSeries(),
            backgroundColor: 'rgba(52,211,153,0.85)',
            borderRadius: 8
          }
        ]
      },
      options: this.commonOptions()
    });

    this.totalCurrentChart = new Chart(this.totalCurrentChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['0', '5', '10', '15', '20', '25', '30'],
        datasets: [
          {
            label: 'Total Current (A)',
            data: this.buildTotalCurrentSeries(),
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56,189,248,0.16)',
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#38bdf8',
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: this.commonOptions()
    });

    this.motorChart = new Chart(this.motorChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['0', '5', '10', '15', '20', '25', '30'],
        datasets: [
          {
            label: 'Motor Current (A)',
            data: this.buildMotorCurrentSeries(),
            borderColor: '#60a5fa',
            backgroundColor: 'rgba(96,165,250,0.15)',
            tension: 0.35,
            fill: true,
            yAxisID: 'y',
            pointBackgroundColor: '#60a5fa',
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'RPM',
            data: this.buildRpmSeries(),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245,158,11,0.15)',
            tension: 0.35,
            fill: false,
            yAxisID: 'y1',
            pointBackgroundColor: '#f59e0b',
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: this.motorOptions()
    });

    this.temperatureChart = new Chart(this.temperatureChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['0', '5', '10', '15', '20', '25', '30'],
        datasets: [
          {
            label: 'Temperature (°C)',
            data: this.buildTemperatureSeries(),
            borderColor: '#fb7185',
            backgroundColor: 'rgba(251,113,133,0.16)',
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#fb7185',
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: this.commonOptions()
    });

    this.lampChart = new Chart(this.lampChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Off', 'Low', 'Medium', 'High', 'Current'],
        datasets: [
          {
            label: 'Lamp Current (A)',
            data: this.buildLampSeries(),
            backgroundColor: [
              'rgba(148,163,184,0.45)',
              'rgba(96,165,250,0.65)',
              'rgba(59,130,246,0.75)',
              'rgba(37,99,235,0.82)',
              'rgba(14,165,233,0.9)'
            ],
            borderRadius: 10
          }
        ]
      },
      options: this.commonOptions()
    });
  }

  private updateAllCharts(): void {
    if (this.consumptionChart) {
      this.consumptionChart.data.datasets[0].data = this.buildConsumptionSeries();
      this.consumptionChart.update('none');
    }

    if (this.compareChart) {
      this.compareChart.data.datasets[1].data = this.buildCompareRealSeries();
      this.compareChart.update('none');
    }

    if (this.totalCurrentChart) {
      this.totalCurrentChart.data.datasets[0].data = this.buildTotalCurrentSeries();
      this.totalCurrentChart.update('none');
    }

    if (this.motorChart) {
      this.motorChart.data.datasets[0].data = this.buildMotorCurrentSeries();
      this.motorChart.data.datasets[1].data = this.buildRpmSeries();
      this.motorChart.update('none');
    }

    if (this.temperatureChart) {
      this.temperatureChart.data.datasets[0].data = this.buildTemperatureSeries();
      this.temperatureChart.update('none');
    }

    if (this.lampChart) {
      this.lampChart.data.datasets[0].data = this.buildLampSeries();
      this.lampChart.update('none');
    }
  }

  private destroyCharts(): void {
    this.consumptionChart?.destroy();
    this.compareChart?.destroy();
    this.totalCurrentChart?.destroy();
    this.motorChart?.destroy();
    this.temperatureChart?.destroy();
    this.lampChart?.destroy();
  }
}
