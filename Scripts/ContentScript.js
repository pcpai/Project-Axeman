/*
 * ContentScript.js
 * 08.09.2011.
 * 
 * by Aleksandar Toplek,
 * JustBuild Development 2011.
 * 
 * Collaborator(s)
 *     Everton Moreth
 * 
 * License can be found in LICENSE.md file 
 * distributed with this file.
 * 
 */

 /**
  * Village model class
  *
  * @author Aleksandar Toplek
  */
 function Village() {
	// Note: Onany *.travian.*/... page (except help)
	this.name = "<NameNotDefined>";
	this.loyalty = 100;
	
	// Note: On spieler.php?uid=* page where * is players id
	this.isMainCity = false;
	this.population = 0;
	this.Position = {
		x: 0,
		y: 0
	};
	
	// Note: Onany *.travian.*/... page (except help)
	this.Resources = {
		lastUpdated: 0,
		
		storage: [0, 0],
		production: [0, 0, 0, 0],
		stored: [0, 0, 0, 0],
		cosumption: 0
	};
	
	// Note: On dorf1.php page
	this.VillageIn = {
		lastUpdated: 0,
		
		levels: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		buildings: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	};
	
	// NOTE: On dorf1.php page
	this.VillageOut = {
		lastUpdated: 0,

		type: "f3",
		levels: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	};
	
	this.Troops = {
		TotalTroops: {
			gauls: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			romans: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			teutons: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			nature: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		}
	};
 }
