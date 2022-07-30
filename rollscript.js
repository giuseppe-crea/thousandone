// actor coherency check
if (!actor || actor.type != 'player'){
  console.log("Wrong user")
  return false;
}else
  console.log(actor.name)
// roll size
const i = 1;
let roll = new Roll(i+`d6`);
roll.evaluate(asynch=false);
// grab the single values of each die
var dieArr = Array(i);
let successes = 0;
let locked = 0;
let critfail = 0;
let stringOfValues = "";
let stringOfUnlockedValues = "";
for(j = 0; j < i; j++){
	// stick them in THE ARRAY and compute both successes and locked-in dice
	dieArr[j] = roll.terms[0].results[j].result;
	stringOfValues = stringOfValues + dieArr[j];
	if(j != i-1)
	 stringOfValues = stringOfValues + " + ";
	if(dieArr[j] > 3)
	 successes++;
	if(dieArr[j] < 6 && dieArr[j] > 1)
	 stringOfUnlockedValues = stringOfUnlockedValues + dieArr[j];
	else if(dieArr[j] === 6){
	 successes++;
	 locked++;
	}
	else if(dieArr[j] === 1){
	 locked++;
	 critfail++;
	}
}

// get current bullets
let bullets = actor.data.data.resources.bullets.value;

const available = i - locked;
if( available > 0){
	let d = new Dialog({
	 title: "Mulligan Opportunity",
	 content: "<p>You rolled "+stringOfValues+", do you want to reroll "+available+" dice?</p>",
	 buttons: {
	  one: {
	   icon: '<i class="fas fa-check"></i>',
	   label: "Reroll",
	   callback: () => {
		   roll = new Roll(available+`d6`);
		   roll.evaluate(asynch=false);
		   if (roll.result >= bullets){
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
			  let newBullets = bullets - roll.result;
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
			console.log("Bullets left: "+actor.data.data.resources.bullets.value);
			console.log("Roll: "+roll.result);
			return roll;
	   }
	  },
	  two: {
	   icon: '<i class="fas fa-times"></i>',
	   label: "Keep",
	   callback: () => {
		   if (roll.result >= bullets){
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
			  let newBullets = bullets - roll.result;
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
			console.log("Bullets left: "+actor.data.data.resources.bullets.value);
			console.log("Roll: "+roll.result);
			return roll;
	   }
	  }
	 },
	 default: "two",
	 render: html => console.log("Register interactivity in the rendered dialog"),
	 close: html => console.log("This always is logged no matter which option is chosen")
	});
	d.render(true);
}
else{
	if (roll.result >= bullets){
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
	  let newBullets = bullets - roll.result;
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
	console.log("Bullets left: "+actor.data.data.resources.bullets.value);
	console.log("Roll: "+roll.result);
	return roll;
}