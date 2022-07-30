const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
async function rollMyStuff(roll, successes, critfail){
	let bullets = actor.data.data.resources.bullets.value;
	if (roll >= bullets || critfail >= 2){
		// trigger a break
		console.log("Break!");
		actor.update({
			data: {
				resources: {
					bullets: {
						value: actor.data.data.resources.bullets.max
					}
				}
			}
		});
	}else{
		let newBullets = bullets - roll;
		actor.update({
			data: {
				resources: {
					bullets: {
						value: newBullets
					}
				}
			}
		});
	}
	await wait(50)
	console.log("Bullets left: "+actor.data.data.resources.bullets.value);
	console.log("Roll: "+roll);
	console.log("Successes: "+successes);
	return successes;
}

async function openDialog(stringOfValues, stringOfUnlockedValues, stringOfLockedValues, available, roll, critfail, successes, critSuccess){
    let dialogContent = "<p>You rolled "+stringOfValues+", which includes "+(parseInt(successes)+parseInt(critSuccess))+" successes. Do you want to reroll "+available+" dice?</p>";
    let d = new Dialog({
        title: "Mulligan Opportunity",
        content: dialogContent,
        buttons: {
			one: {
				icon: '<i class="fas fa-check"></i>',
				label: "Reroll",
				callback: () => {
					roll2 = new Roll(available+`d6`);
					roll2.evaluate(asynch=true);
					let successes = 0;
					for(k = 0; k < available; k++){
						rollVal = roll2.terms[0].results[k].result;
						if(rollVal > 3)
							successes++;
						if(rollVal === 6){
							successes++;
						}
						else if(rollVal === 1){
							critfail++;
						}
						stringOfUnlockedValues = stringOfUnlockedValues + " + " + rollVal;
					}
					successes = critSuccess*2 + successes;
					console.log(stringOfLockedValues);
					const oldValues = stringOfLockedValues != '' ? parseInt(stringOfLockedValues) : 0;
					console.log("old values: " + oldValues);
					rollMyStuff(oldValues+parseInt(roll2.result), successes, critfail);
				}
			},
			two: {
				icon: '<i class="fas fa-times"></i>',
			    label: "Keep",
			    callback: () =>{
					rollMyStuff(roll.result, successes, 0);
				}
			}
        },
        default: "two",
		render: html => console.log("Register interactivity in the rendered dialog"),
		close: html => console.log("This always is logged no matter which option is chosen")
	});
    d.render(true)
    await wait(50)
}
(async () => {
	// actor coherency check
	if (!actor || actor.type != 'player'){
	  console.log("Wrong user")
	  return false;
	}else
	  console.log(actor.name)
	// roll size
	const i = 1;
	if (actor.data.data.attributes.clip.value < i){
		console.log("Not enough Clip");
		return false;
	}
	let roll = new Roll(i+`d6`);
	roll.evaluate(asynch=false);
	// grab the single values of each die
	var dieArr = Array(i);
	let successes = 0;
	let critSuccess = 0;
	let locked = 0;
	let critfail = 0;
	let stringOfValues = "";
	let stringOfUnlockedValues = "";
	let stringOfLockedValues = "";
	for(j = 0; j < i; j++){
		// stick them in THE ARRAY and compute both successes and locked-in dice
		dieArr[j] = roll.terms[0].results[j].result;
		stringOfValues = stringOfValues + dieArr[j];
		if(j != i-1)
			stringOfValues = stringOfValues + " + ";
		if(dieArr[j] > 3)
			successes++;
		if(dieArr[j] < 6 && dieArr[j] > 1)
			stringOfUnlockedValues = stringOfUnlockedValues + " + " + dieArr[j];
		else if(dieArr[j] === 6){
			critSuccess++;
			locked++;
			stringOfLockedValues = stringOfLockedValues + " + " + dieArr[j];
		}
		else if(dieArr[j] === 1){
			locked++;
			critfail++;
			stringOfLockedValues = stringOfLockedValues + " + " + dieArr[j];
		}
	}

	const available = i - locked;
	if( available > 0){
		openDialog(stringOfValues, stringOfUnlockedValues, stringOfLockedValues, available, roll, critfail, successes, critSuccess);
	}else
		rollMyStuff(roll.result, successes+critSuccess, 0);
})();