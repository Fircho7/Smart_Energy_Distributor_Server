import { Injectable } from '@angular/core';

export type LoadState = 'ON' | 'OFF';
export type LoadMode = 'Auto' | 'Manual';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type ControlType = 'speed' | 'brightness' | 'temperature' | 'flow';
export type SystemMode = 'ECO' | 'NORMAL' | 'PRIORITY' | 'CRITICAL';

export interface LoadItem {
  name: string;
  description: string;
  state: LoadState;
  current: string;
  mode: LoadMode;
  priority: PriorityLevel;
  usage: number;
  nominalCurrent: number;
  controlType: ControlType;
  controlLabel: string;
  controlValue: number;
  controlUnit: string;
  minControl: number;
  maxControl: number;
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  systemMode: SystemMode = 'NORMAL';
  savingsThisMonth = '0.0 kWh';
  lastUpdate = 'Just now';

  warningThreshold = '3.5 A';
  criticalThreshold = '4.5 A';
  lampPriorityLimit = 'Always Protected';
  motorReductionStep = '15% PWM';

  costPerKwh = '1 €';
  expectedMonthlyUsage = '18.6 kWh';
  expectedLampActiveTime = '4 h/day';
  expectedMotorActivity = '2 h/day';

  readonly defaultExpectedLampActiveTime = 4;
  readonly defaultExpectedMotorActivity = 2;

  dataVersion = 0;

  dashboardCards = [
    { label: 'Current Total', value: '0.00 A', description: 'Live mock value' },
    { label: 'Expected Usage', value: '18.6 kWh', description: 'This month' },
    { label: 'Real Usage', value: '0.0 kWh', description: 'This month' },
    { label: 'Energy Saved', value: '0.0 kWh', description: 'Estimated monthly savings' }
  ];

  loads: LoadItem[] = [
    {
      name: 'Lamp',
      description: 'Adjustable lighting consumer with variable output level.',
      state: 'ON',
      current: '1.49 A',
      mode: 'Auto',
      priority: 'High',
      usage: 85,
      nominalCurrent: 1.75,
      controlType: 'brightness',
      controlLabel: 'Brightness',
      controlValue: 85,
      controlUnit: '%',
      minControl: 0,
      maxControl: 100
    },
    {
      name: 'Motor',
      description: 'Adjustable motor-driven consumer with variable speed control.',
      state: 'ON',
      current: '0.43 A',
      mode: 'Manual',
      priority: 'Medium',
      usage: 72,
      nominalCurrent: 0.60,
      controlType: 'speed',
      controlLabel: 'Speed',
      controlValue: 72,
      controlUnit: '%',
      minControl: 0,
      maxControl: 100
    },
    {
      name: 'Pump',
      description: 'Flow-controlled consumer for variable fluid transfer operation.',
      state: 'OFF',
      current: '0.00 A',
      mode: 'Auto',
      priority: 'Medium',
      usage: 0,
      nominalCurrent: 0.90,
      controlType: 'flow',
      controlLabel: 'Flow',
      controlValue: 40,
      controlUnit: '%',
      minControl: 0,
      maxControl: 100
    },
    {
      name: 'Ceramic Load',
      description: 'Temperature-controlled thermal consumer with adjustable target level.',
      state: 'OFF',
      current: '0.00 A',
      mode: 'Manual',
      priority: 'Low',
      usage: 0,
      nominalCurrent: 1.60,
      controlType: 'temperature',
      controlLabel: 'Temperature',
      controlValue: 45,
      controlUnit: '°C',
      minControl: 20,
      maxControl: 80
    }
  ];

  priorities = [
    {
      name: 'Lamp',
      description: 'Primary lighting load protected by automation rules and motion-triggered logic.',
      level: 'High'
    },
    {
      name: 'Motor',
      description: 'Controlled dynamic load that may be reduced in PWM before lower-priority shutdown occurs.',
      level: 'Medium'
    },
    {
      name: 'Pump',
      description: 'Secondary consumer that can be limited or disabled under warning and critical conditions.',
      level: 'Medium'
    },
    {
      name: 'Ceramic Load',
      description: 'Lowest-priority resistive branch designed to be reduced or disconnected first.',
      level: 'Low'
    }
  ];

  rules = [
    {
      title: 'Priority Protection',
      text: 'High-priority consumers should remain active as long as the system can operate safely.'
    },
    {
      title: 'Progressive Reduction',
      text: 'Instead of shutting everything down immediately, the system first lowers lower-priority demand.'
    },
    {
      title: 'Critical Protection Mode',
      text: 'If total current becomes too high, only protected essential loads remain active.'
    }
  ];

  automationSettings = [
    {
      title: 'Motion-based Lamp Control',
      description: 'Automatically activates lighting based on motion detection logic.',
      enabled: true
    },
    {
      title: 'Motor Load Reduction',
      description: 'Reduces motor PWM when current threshold is exceeded.',
      enabled: true
    },
    {
      title: 'Low Priority Shutdown',
      description: 'Disables low-priority consumers under critical load conditions.',
      enabled: true
    },
    {
      title: 'Manual Override',
      description: 'Allows direct control even when automation is active.',
      enabled: false
    }
  ];

  constructor() {
    this.syncDashboardCards();
  }

  private parseCurrent(current: string): number {
    const value = parseFloat(current.replace('A', '').trim());
    return isNaN(value) ? 0 : value;
  }

  private parseNumber(value: string): number {
    const normalized = value
      .replace('€', '')
      .replace('kWh', '')
      .replace('h/day', '')
      .trim();

    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }

  formatCurrent(value: number): string {
    return `${value.toFixed(2)} A`;
  }

  formatEnergy(value: number): string {
    return `${value.toFixed(1)} kWh`;
  }

  formatCurrency(value: number): string {
    return `€${value.toFixed(2)}`;
  }

  get activeLoads(): number {
    return this.loads.filter(load => load.state === 'ON').length;
  }

  get totalCurrentValue(): number {
    return this.loads.reduce((sum, load) => sum + this.parseCurrent(load.current), 0);
  }

  get totalCurrent(): string {
    return this.formatCurrent(this.totalCurrentValue);
  }

  get highestPriorityActive(): string {
    for (const priorityItem of this.priorities) {
      const activeLoad = this.loads.find(
        load => load.name === priorityItem.name && load.state === 'ON'
      );
      if (activeLoad) return activeLoad.name;
    }
    return 'None';
  }

  get costPerKwhValue(): number {
    return this.parseNumber(this.costPerKwh);
  }

  get expectedLampHoursPerDay(): number {
    return this.parseNumber(this.expectedLampActiveTime);
  }

  get expectedMotorHoursPerDay(): number {
    return this.parseNumber(this.expectedMotorActivity);
  }

  get lampNominalPowerW(): number {
    const lamp = this.loads.find(load => load.name === 'Lamp');
    return lamp ? 12 * lamp.nominalCurrent : 0;
  }

  get motorNominalPowerW(): number {
    const motor = this.loads.find(load => load.name === 'Motor');
    return motor ? 12 * motor.nominalCurrent : 0;
  }

  get manualExpectedMonthlyUsageValue(): number {
    return this.parseNumber(this.expectedMonthlyUsage);
  }

  get defaultLampMonthlyKwh(): number {
    return (this.lampNominalPowerW * this.defaultExpectedLampActiveTime * 30) / 1000;
  }

  get defaultMotorMonthlyKwh(): number {
    return (this.motorNominalPowerW * this.defaultExpectedMotorActivity * 30) / 1000;
  }

  get currentLampMonthlyKwh(): number {
    return (this.lampNominalPowerW * this.expectedLampHoursPerDay * 30) / 1000;
  }

  get currentMotorMonthlyKwh(): number {
    return (this.motorNominalPowerW * this.expectedMotorHoursPerDay * 30) / 1000;
  }

  get expectedMonthlyUsageValue(): number {
    const base = this.manualExpectedMonthlyUsageValue;
    const lampDelta = this.currentLampMonthlyKwh - this.defaultLampMonthlyKwh;
    const motorDelta = this.currentMotorMonthlyKwh - this.defaultMotorMonthlyKwh;

    return Number(Math.max(base + lampDelta + motorDelta, 0).toFixed(1));
  }

  get expectedMonthlyUsageComputed(): string {
    return this.formatEnergy(this.expectedMonthlyUsageValue);
  }

  get realMonthlyUsageValue(): number {
    const real = this.loads.reduce((sum, load) => {
      const current = this.parseCurrent(load.current);
      const powerW = current * 12;
      return sum + (powerW * 2.5 * 30) / 1000;
    }, 0);

    return Number(real.toFixed(1));
  }

  get realMonthlyUsage(): string {
    return this.formatEnergy(this.realMonthlyUsageValue);
  }

  get savedEnergyValue(): number {
    const saved = this.expectedMonthlyUsageValue - this.realMonthlyUsageValue;
    return Number(Math.max(saved, 0).toFixed(1));
  }

  get savedEnergy(): string {
    return this.formatEnergy(this.savedEnergyValue);
  }

  get savedCostValue(): number {
    return Number((this.savedEnergyValue * this.costPerKwhValue).toFixed(2));
  }

  get savedCost(): string {
    return this.formatCurrency(this.savedCostValue);
  }

  get efficiencyPercent(): string {
    if (this.expectedMonthlyUsageValue <= 0) return '0.0%';
    const percent = (this.savedEnergyValue / this.expectedMonthlyUsageValue) * 100;
    return `${percent.toFixed(1)}%`;
  }

  getMaxAllowedControl(load: LoadItem): number {
    switch (this.systemMode) {
      case 'ECO':
        if (load.name === 'Lamp') return 80;
        if (load.name === 'Motor') return 70;
        if (load.name === 'Pump') return 60;
        if (load.name === 'Ceramic Load') return 50;
        return load.maxControl;

      case 'NORMAL':
        return load.maxControl;

      case 'PRIORITY':
        if (load.priority === 'High') return load.maxControl;
        if (load.priority === 'Medium') return Math.round(load.maxControl * 0.75);
        return Math.round(load.maxControl * 0.5);

      case 'CRITICAL':
        if (load.name === 'Lamp') return Math.min(load.maxControl, 70);
        if (load.name === 'Motor') return Math.min(load.maxControl, 40);
        if (load.name === 'Pump') return 0;
        if (load.name === 'Ceramic Load') return 0;
        return load.maxControl;
    }
  }

  applySystemMode(): void {
    for (const load of this.loads) {
      const maxAllowed = this.getMaxAllowedControl(load);

      if (maxAllowed === 0 && (load.name === 'Pump' || load.name === 'Ceramic Load')) {
        load.state = 'OFF';
        load.usage = 0;
        load.current = '0.00 A';
        continue;
      }

      if (load.controlValue > maxAllowed) {
        load.controlValue = maxAllowed;
      }

      if (load.state === 'ON') {
        this.recalculateLoad(load, false);
      }
    }

    this.syncDashboardCards();
  }

  recalculateLoad(load: LoadItem, sync: boolean = true): void {
    if (load.state === 'OFF') {
      load.usage = 0;
      load.current = '0.00 A';
      if (sync) this.syncDashboardCards();
      return;
    }

    const maxAllowed = this.getMaxAllowedControl(load);
    if (load.controlValue > maxAllowed) {
      load.controlValue = maxAllowed;
    }

    let ratio = 0;

    if (load.controlType === 'temperature') {
      ratio = (load.controlValue - load.minControl) / (load.maxControl - load.minControl);
    } else {
      ratio = load.controlValue / load.maxControl;
    }

    ratio = Math.max(0, Math.min(1, ratio));

    load.usage = Math.round(ratio * 100);
    load.current = this.formatCurrent(load.nominalCurrent * ratio);

    if (sync) this.syncDashboardCards();
  }

  syncDashboardCards(): void {
    this.dashboardCards[0].value = this.totalCurrent;
    this.dashboardCards[1].value = this.expectedMonthlyUsageComputed;
    this.dashboardCards[2].value = this.realMonthlyUsage;
    this.dashboardCards[3].value = this.savedEnergy;
    this.savingsThisMonth = this.savedEnergy;
    this.lastUpdate = 'Just now';
    this.dataVersion++;
  }
}
