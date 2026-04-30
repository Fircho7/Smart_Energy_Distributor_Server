import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  constructor(public mockData: MockDataService) {}

  get activeLoadList() {
    return this.mockData.loads.filter(load => load.state === 'ON');
  }
}
