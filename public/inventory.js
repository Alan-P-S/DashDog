import { Player } from './player.js';

const inventoryDiv = document.getElementById('inventory');
const storedUser = JSON.parse(localStorage.getItem('user')) || { purchasedSprites: [] };

function populateInventory() {
    storedUser.purchasedSprites.forEach(sprite => {
        const spriteButton = document.createElement('button');
        spriteButton.textContent = `Equip ${sprite}`;
        spriteButton.onclick = () => equipSprite(sprite);
        inventoryDiv.appendChild(spriteButton);
    });
}

function equipSprite(spriteSheet) {
   // Player.image = spriteSheet; // Assuming `game` is your game instance
   // player.changeSpriteSheet(spriteSheet);
    console.log(Player.width);
    console.log(spriteSheet);
    alert(`Equipped sprite: ${spriteSheet}`);
}

// Populate inventory on load
populateInventory();
