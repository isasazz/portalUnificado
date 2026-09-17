import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal
} from '@angular/core';

import {
  STANDBY_POLICIES_INTRO,
  STANDBY_POLICY_ACCORDION,
  StandbyPolicyAccordionItem,
  StandbyPolicyAction,
  StandbyPolicyBullet,
  policyBulletNote,
  policyBulletText
} from '../../data/standby-policies.data';

@Component({
  selector: 'app-standby-policies-viewer',
  standalone: true,
  templateUrl: './standby-policies-viewer.html',
  styleUrl: './standby-policies-viewer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyPoliciesViewerComponent {

  readonly openProgram = output<void>();

  readonly intro = STANDBY_POLICIES_INTRO;

  readonly items = STANDBY_POLICY_ACCORDION;

  readonly openId = signal<string | null>(null);

  readonly soonHint = signal('');

  toggle(item: StandbyPolicyAccordionItem): void {
    this.openId.update(current =>
      current === item.id ? null : item.id
    );
    this.soonHint.set('');
  }

  isOpen(item: StandbyPolicyAccordionItem): boolean {
    return this.openId() === item.id;
  }

  goToProgram(): void {
    this.openProgram.emit();
  }

  onPersonalClick(): void {
    this.soonHint.set(
      'Pronto: el acceso a Personal del Stand By quedará disponible aquí.'
    );
  }

  onAction(action: StandbyPolicyAction): void {
    if (action.kind === 'program') {
      this.openProgram.emit();
      return;
    }

    this.soonHint.set(
      `“${action.label}” estará disponible pronto en el portal.`
    );
  }

  /** Convierte **texto** en <strong>texto</strong> de forma segura. */
  richText(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(
        /\*\*(.+?)\*\*/g,
        '<strong>$1</strong>'
      );
  }

  bulletText(bullet: StandbyPolicyBullet): string {
    return policyBulletText(bullet);
  }

  bulletNote(bullet: StandbyPolicyBullet): string | undefined {
    return policyBulletNote(bullet);
  }

}
