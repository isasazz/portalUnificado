import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  COUNTRY_DIAL_CODES,
  CountryDialCode,
  DEFAULT_COUNTRY_ISO
} from '../../data/country-dial-codes';

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './phone-input.html',
  styleUrl: './phone-input.scss'
})
export class PhoneInputComponent implements OnChanges {

  @Input()
  value = '';

  @Input()
  disabled = false;

  @Output()
  valueChange = new EventEmitter<string>();

  readonly countries = COUNTRY_DIAL_CODES;

  selectedCountry: CountryDialCode =
    this.findCountry(DEFAULT_COUNTRY_ISO)!;

  localNumber = '';

  search = '';

  dropdownOpen = false;

  get filteredCountries(): CountryDialCode[] {

    const term = this.search.trim().toLowerCase();

    if (!term) {
      return this.countries;
    }

    return this.countries.filter(country =>
      country.name.toLowerCase().includes(term) ||
      country.dial.includes(term) ||
      country.iso.toLowerCase().includes(term)
    );

  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['value']) {
      this.parseValue(this.value);
    }

  }

  toggleDropdown(): void {

    if (this.disabled) {
      return;
    }

    this.dropdownOpen = !this.dropdownOpen;

    if (this.dropdownOpen) {
      this.search = '';
    }

  }

  selectCountry(country: CountryDialCode): void {

    this.selectedCountry = country;
    this.dropdownOpen = false;
    this.search = '';
    this.emitValue();

  }

  onLocalNumberChange(value: string): void {

    this.localNumber = value.replace(/[^\d\s-]/g, '');
    this.emitValue();

  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {

    const target = event.target as HTMLElement | null;

    if (!target?.closest('.phone-input')) {
      this.dropdownOpen = false;
    }

  }

  private emitValue(): void {

    const digits = this.localNumber.replace(/\D/g, '');

    const full = digits
      ? `+${this.selectedCountry.dial} ${this.localNumber.trim()}`
      : `+${this.selectedCountry.dial}`;

    this.valueChange.emit(full.trim());

  }

  private parseValue(raw: string): void {

    const cleaned = (raw || '').trim();

    if (!cleaned) {
      this.selectedCountry =
        this.findCountry(DEFAULT_COUNTRY_ISO)!;
      this.localNumber = '';
      return;
    }

    const normalized = cleaned.replace(/^\+/, '');
    const sorted = [...this.countries].sort(
      (a, b) => b.dial.length - a.dial.length
    );

    const match = sorted.find(country =>
      normalized === country.dial ||
      normalized.startsWith(country.dial + ' ') ||
      normalized.startsWith(country.dial)
    );

    if (match) {
      this.selectedCountry = match;
      this.localNumber = normalized
        .slice(match.dial.length)
        .trim();
      return;
    }

    this.selectedCountry =
      this.findCountry(DEFAULT_COUNTRY_ISO)!;
    this.localNumber = cleaned.replace(/^\+?57\s?/, '');

  }

  private findCountry(
    iso: string
  ): CountryDialCode | undefined {

    return this.countries.find(
      country => country.iso === iso
    );

  }

}
