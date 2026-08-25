import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService }
from './core/services/theme.service';

import { SaveSuccessModalComponent }
from './shared/components/save-success-modal/save-success-modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SaveSuccessModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {

  private readonly themeService =
    inject(ThemeService);

}
