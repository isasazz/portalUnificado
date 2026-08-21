import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject
} from '@angular/core';
import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { ThemeService }
from '../../core/services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {

  private readonly themeService =
    inject(ThemeService);

  @Input()
  collapsed = false;

  @Output()
  toggle =
    new EventEmitter<void>();

  get isDark(): boolean {

    return this.themeService.theme() === 'dark';

  }

  onToggle(): void {

    this.toggle.emit();

  }

  onToggleTheme(): void {

    this.themeService.toggle();

  }

}
