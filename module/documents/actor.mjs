/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class ThousandAndOneActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags.thousandandone || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'player') return;
    // Make modifications to data here. For example:
    const data = actorData.data;
	const maxBullets = data.attributes.bandolier.value * 10;
	const currBullets = data.resources.bullets.value;
	data.resources.bullets.max = maxBullets;
	data.resources.bullets.value = currBullets > maxBullets ? maxBullets : currBullets;
	data.resources.respect.max = data.attributes.engraving.value;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
	this._getNPCRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.data.type !== 'player') return;

    // return remaining bullets and max clip size
    if (data.attributes.bullets && data. attributes.clip) {
      data.bullets = data.resources.bullets.value ?? 0;
	  data.clip = data.attributes.clip.value ?? 0;
    }
  }
  
  _getNPCRollData(data){
	  if (this.data.type !== 'npc') return;
	  
	  // return the three stat values for npcs
	  if (data.attributes.physical && data.attributes.mental && data.attributes.social) {
		  data.phys = data.attributes.physical.value ?? 0;
		  data.ment = data.attributes.mental.value ?? 0;
		  data.socl = data.attributes.social.value ?? 0;
	  }
  }

}