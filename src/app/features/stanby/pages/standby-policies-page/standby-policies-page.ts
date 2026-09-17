import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { StandbyPoliciesViewerComponent }
from '../../components/standby-policies-viewer/standby-policies-viewer';

@Component({
  selector: 'app-standby-policies-page',
  standalone: true,
  imports: [RouterLink, StandbyPoliciesViewerComponent],
  templateUrl: './standby-policies-page.html',
  styleUrl: './standby-policies-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyPoliciesPageComponent {

  private readonly router = inject(Router);

  goToProgram(): void {
    void this.router.navigate(['/standby'], {
      queryParams: { tab: 'program' }
    });
  }

}
