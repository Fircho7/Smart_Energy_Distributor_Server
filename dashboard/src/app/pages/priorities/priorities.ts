import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MockDataService } from '../../services/mock-data.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './priorities.html',
  styleUrl: './priorities.css'
})
export class PrioritiesComponent {
  constructor(public mockData: MockDataService) {}

  moveUp(index: number): void {
    if (index === 0) return;

    const item = this.mockData.priorities[index];
    this.mockData.priorities[index] = this.mockData.priorities[index - 1];
    this.mockData.priorities[index - 1] = item;

    this.syncLoadsWithPriorities();
    this.mockData.lastUpdate = 'Just now';
  }

  moveDown(index: number): void {
    if (index === this.mockData.priorities.length - 1) return;

    const item = this.mockData.priorities[index];
    this.mockData.priorities[index] = this.mockData.priorities[index + 1];
    this.mockData.priorities[index + 1] = item;

    this.syncLoadsWithPriorities();
    this.mockData.lastUpdate = 'Just now';
  }

  private syncLoadsWithPriorities(): void {
    this.mockData.priorities.forEach((priorityItem, index) => {
      const matchingLoad = this.mockData.loads.find(load => load.name === priorityItem.name);

      if (!matchingLoad) return;

      if (index === 0) {
        matchingLoad.priority = 'High';
        priorityItem.level = 'High';
      } else if (index === 1 || index === 2) {
        matchingLoad.priority = 'Medium';
        priorityItem.level = 'Medium';
      } else {
        matchingLoad.priority = 'Low';
        priorityItem.level = 'Low';
      }
    });

    this.mockData.syncDashboardCards();
  }
}
