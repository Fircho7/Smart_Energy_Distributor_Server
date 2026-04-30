import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService, SystemMode } from '../../services/mock-data.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent {
  modes: SystemMode[] = ['ECO', 'NORMAL', 'PRIORITY', 'CRITICAL'];

  constructor(public mockData: MockDataService) {}

  toggleAutomation(index: number): void {
    this.mockData.automationSettings[index].enabled =
      !this.mockData.automationSettings[index].enabled;
    this.mockData.lastUpdate = 'Just now';
    this.mockData.dataVersion++;
  }

  setMode(mode: SystemMode): void {
    this.mockData.systemMode = mode;
    this.mockData.applySystemMode();
    this.mockData.syncDashboardCards();
    this.mockData.lastUpdate = 'Just now';
  }

  onSettingsChange(): void {
    this.mockData.syncDashboardCards();
    this.mockData.lastUpdate = 'Just now';
  }

  onEnergyModelChange(): void {
    this.mockData.syncDashboardCards();
    this.mockData.lastUpdate = 'Just now';
  }

  saveSettings(): void {
    this.mockData.applySystemMode();
    this.mockData.syncDashboardCards();
    this.mockData.lastUpdate = 'Just now';
  }
}
