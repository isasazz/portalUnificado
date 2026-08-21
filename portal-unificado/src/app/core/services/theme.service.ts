import { Injectable, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'portal-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  readonly theme = signal<AppTheme>(this.readInitial());

  constructor() {

    this.apply(this.theme());

  }

  get isDark(): boolean {

    return this.theme() === 'dark';

  }

  toggle(): void {

    this.setTheme(
      this.isDark ? 'light' : 'dark'
    );

  }

  setTheme(theme: AppTheme): void {

    this.theme.set(theme);
    this.apply(theme);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }

  }

  private readInitial(): AppTheme {

    try {

      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (saved === 'dark' || saved === 'light') {
        return saved;
      }

    } catch {
      // ignore
    }

    return 'light';

  }

  private apply(theme: AppTheme): void {

    document.documentElement.setAttribute(
      'data-theme',
      theme
    );

  }

}
