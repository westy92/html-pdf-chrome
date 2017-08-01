export default interface ScreenOrientation {
  /**
   * Orientation type. Allowed values: portraitPrimary, portraitSecondary, landscapePrimary, landscapeSecondary.
   */
  type: 'portraitPrimary' | 'portraitSecondary' | 'landscapePrimary' | 'landscapeSecondary';
  /**
   * Orientation angle.
   */
  angle: number;
}
