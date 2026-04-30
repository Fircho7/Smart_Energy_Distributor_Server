import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadItem, MockDataService } from '../../services/mock-data.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loads.html',
  styleUrl: './loads.css'
})
export class LoadsComponent {
  constructor(public mockData: MockDataService) {}

  get loads(): LoadItem[] {
    return this.mockData.loads;
  }

  turnOn(load: LoadItem): void {
    load.state = 'ON';
    load.mode = 'Manual';
    this.mockData.recalculateLoad(load);
  }

  turnOff(load: LoadItem): void {
    load.state = 'OFF';
    load.mode = 'Manual';
    this.mockData.recalculateLoad(load);
  }

  setAuto(load: LoadItem): void {
    load.mode = 'Auto';

    if (load.name === 'Lamp') load.controlValue = 85;
    if (load.name === 'Motor') load.controlValue = 72;
    if (load.name === 'Pump') load.controlValue = 40;
    if (load.name === 'Ceramic Load') load.controlValue = 45;

    if (load.state === 'ON') {
      this.mockData.recalculateLoad(load);
    } else {
      this.mockData.syncDashboardCards();
    }
  }

  onControlChange(load: LoadItem): void {
    load.mode = 'Manual';

    if (load.state === 'ON') {
      this.mockData.recalculateLoad(load);
    } else {
      this.mockData.syncDashboardCards();
    }
  }

  getMaxAllowed(load: LoadItem): number {
    return this.mockData.getMaxAllowedControl(load);
  }

  isControlDisabled(load: LoadItem): boolean {
    return this.getMaxAllowed(load) === 0;
  }

  getDisabledReason(load: LoadItem): string {
    if (this.mockData.systemMode === 'CRITICAL' && this.isControlDisabled(load)) {
      return 'Disabled by CRITICAL mode';
    }

    return '';
  }

  get activeLoads(): number {
    return this.mockData.activeLoads;
  }

  get totalMockDraw(): string {
    return this.mockData.totalCurrent;
  }

  get highestPriorityActive(): string {
    return this.mockData.highestPriorityActive;
  }

  displayControlValue(load: LoadItem): string {
    return `${load.controlValue}${load.controlUnit}`;
  }
}
