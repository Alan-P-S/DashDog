const store = document.getElementById('sprites');
const user = { balance: 200, purchasedSprites: ["default-sprite.png"] };

fetch('/sprites.json') // Fetch available sprites
    .then(response => response.json())
    .then(sprites => {
        sprites.forEach(sprite => {
            const spriteDiv = document.createElement('div');
            spriteDiv.innerHTML = `
                <h3>${sprite.name}</h3>
                <p>Price: ${sprite.price}</p>
                <button onclick="buySprite('${sprite.spriteSheet}', ${sprite.price})">Buy</button>`;
            store.appendChild(spriteDiv);
        });
    });


function buySprite(spriteSheet, price) {
    if (user.balance >= price) {
        user.balance -= price;
        user.purchasedSprites.push(spriteSheet);
        alert('Purchase successful!');
        localStorage.setItem('user', JSON.stringify(user)); // Save user data
        console.log(localStorage.user);
    } else {
        alert('Not enough balance!');
    }
}
